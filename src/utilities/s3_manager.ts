import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import logger from './logger/winston_logger';
import * as secretStore from './secret/secret_store';
import type {Readable} from 'stream';

import ResponseError from './response_error';
import axios from 'axios';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  logger: logger,
});

const getS3SignedUrl = async (
  bucketName: string | undefined,
  filePath: string,
  ttl: number,
  put: boolean
) => {
  if (filePath.startsWith('/')) {
    filePath = filePath.substring(1);
  }
  let result = null;
  try {
    if (put) {
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      });
      result = await getSignedUrl(s3Client, putCommand, {expiresIn: ttl});
    } else {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      });
      result = await getSignedUrl(s3Client, getCommand, {expiresIn: ttl});
    }
  } catch (error) {
    logger.error('', error);
  }
  return result;
};

async function getS3UploadSignedUrl(
  bucketName: string | undefined,
  filePath: string,
  ttl: number
) {
  return await getS3SignedUrl(bucketName, filePath, ttl, true);
}

export async function getS3DownloadSignedUrl(element: FileObject) {
  const result: FileObject = {
    name: null,
    url: null,
  };
  if (element && element.bucket && element.path && element.name) {
    result.name = element.name;
    result.url = await getS3SignedUrl(
      element.bucket,
      element.path + element.name,
      3600,
      false
    );
  }
  return result;
}

export interface FileObject {
  bucket?: string;
  path?: string;
  name?: string | null;
  url?: string | null;
}

interface imageObject {
  image_bucket?: string | undefined;
  image_url?: string | undefined;
  image_path?: string | undefined;
}

export async function generateDownloadFileURL(element?: FileObject) {
  const result: FileObject = {
    name: null,
    url: null,
  };
  if (element && element.bucket && element.path && element.name) {
    result.name = element.name;
    result.url = await getDownloadUrl(
      element.path + element.name,
      element.bucket
    );
  }
  return result;
}

export async function generateDownloadURLs(elements: imageObject[]) {
  for (let i = 0; i < elements.length; i++) {
    elements[i] = await generateDownloadURL(elements[i]);
  }
  return elements;
}

export async function generateDownloadURL(element: imageObject) {
  element.image_url = '';
  if (element.image_bucket && element.image_path) {
    element.image_url =
      (await getDownloadUrl(element.image_path, element.image_bucket)) || '';
  }
  delete element.image_bucket;
  delete element.image_path;
  return element;
}

export async function getS3TempUploadSignedUrl(file_name: string) {
  return await getS3UploadSignedUrl(
    process.env.S3_BUCKET_TEMP, // image name , image path, Option = image or file type
    file_name,
    3600
  );
}

export async function saveS3Files(
  is_public: boolean,
  newFileObjects: FileObject[],
  oldFileObjects?: FileObject[]
): Promise<FileObject[] | undefined> {
  try {
    if (!newFileObjects) return;
    for (let i = 0; i < newFileObjects.length; i++) {
      const newFileObject = newFileObjects[i];
      try {
        if (newFileObject.path && newFileObject.name) {
          const isOld = oldFileObjects?.filter(item => {
            return item.name === newFileObjects[i].name;
          })[0];
          if (!isOld) {
            logger.debug('Saving New File From List', newFileObject);
            const bucketName = await moveFileFromTemp(
              newFileObject.name,
              newFileObject.path + newFileObject.name,
              is_public
            );
            newFileObject.bucket = bucketName;
          } else {
            logger.debug('Skipping File Already in List', newFileObject);
            newFileObject.bucket = isOld.bucket;
          }
        }
      } catch (error) {
        logger.error('File Saving Error', error);
        if (error && (error as {Code: string}).Code === 'NoSuchKey') {
          throw new ResponseError(
            400,
            'File Not Uploaded: ' + newFileObject.name
          );
        }
        throw new ResponseError(
          500,
          'File Saving Failed :' + i + ':' + newFileObject.name
        );
      }
    }
    for (let i = 0; oldFileObjects && i < oldFileObjects?.length; i++) {
      const oldFileObject = oldFileObjects[i];
      try {
        if (oldFileObject.path && oldFileObject.name && oldFileObject.bucket) {
          const isNew = newFileObjects?.filter(item => {
            return item.name === oldFileObject.name;
          })[0];
          if (!isNew) {
            logger.debug('Deleting File Not in List', oldFileObject);
            await deleteFile(
              oldFileObject.bucket,
              oldFileObject.path + oldFileObject.name
            );
          }
        }
      } catch (error) {
        logger.error('File Delete Error', error);
        if (error && (error as {Code: string}).Code === 'NoSuchKey') {
          logger.error('File Not Uploaded : ' + oldFileObject.name);
        } else {
          throw new ResponseError(
            500,
            'File Delete Failed :' + oldFileObject.name
          );
        }
      }
    }
    return newFileObjects;
  } catch (error) {
    logger.error('File Update Error', error);
    throw error;
  }
}

export async function saveS3File(
  is_public: boolean,
  newFileObject: FileObject,
  oldFileObject?: FileObject | null
): Promise<FileObject | undefined> {
  try {
    if (!newFileObject || !newFileObject.path || !newFileObject.name) return;
    logger.debug('Saving file', {is_public, newFileObject, oldFileObject});
    if (oldFileObject && oldFileObject.name === newFileObject.name) {
      logger.debug('Skipping.. ', 'old and new files are same');
      return oldFileObject;
    }

    const bucketName = await moveFileFromTemp(
      newFileObject.name,
      newFileObject.path + newFileObject.name,
      is_public
    );
    logger.debug('file successfully moved from temp bucket', {bucketName});

    if (oldFileObject && oldFileObject.bucket && oldFileObject.path) {
      logger.debug('Deleting old file', oldFileObject);
      await deleteFile(
        oldFileObject.bucket,
        oldFileObject.path + oldFileObject.name
      );
      logger.debug('old file deleted successfully');
    }
    logger.debug('save s3 file result', {
      name: newFileObject.name,
      bucket: bucketName,
      path: newFileObject.path,
    });
    return {
      name: newFileObject.name,
      bucket: bucketName,
      path: newFileObject.path,
    };
  } catch (error) {
    logger.error('File Update Error', error);
    if (error && (error as {Code: string}).Code === 'NoSuchKey') {
      throw new ResponseError(400, 'File Not Uploaded: ' + newFileObject.name);
    }
    throw new ResponseError(500, 'File Saving Failed :' + newFileObject.name);
  }
}

export async function getTempFileData(sourceFile: string) {
  return getFileData(sourceFile, process.env.S3_BUCKET_TEMP!);
}

function getCfDownloadUrl(filePath: string, cfUrl: string) {
  if (!filePath) return '';
  if (!filePath.startsWith('/')) filePath = '/' + filePath;
  return cfUrl + filePath;
}

function getCfDownloadSignedUrl(
  filePath: string,
  cfUrl: string,
  ttl: number
): string {
  const expires = new Date().getTime() + ttl * 1000; //14266254645,
  const cfsign = require('aws-cloudfront-sign');
  const signingParams = {
    keypairId: secretStore.getSecret('CF_PUBLIC_KEY'),
    privateKeyString: secretStore.getSecret('CF_PRIVATE_KEY'),
    expireTime: expires,
  };
  return cfsign.getSignedUrl(
    getCfDownloadUrl(filePath, cfUrl),
    signingParams
  ) as string;
}

async function getDownloadUrl(filePath: string, bucket: string) {
  let ttl = 300;
  if (
    process.env.CF_S3_PRIVATE_URL_EXPIRY_TIME &&
    !isNaN(+process.env.CF_S3_PRIVATE_URL_EXPIRY_TIME)
  ) {
    if (
      +process.env.CF_S3_PRIVATE_URL_EXPIRY_TIME > 60 &&
      +process.env.CF_S3_PRIVATE_URL_EXPIRY_TIME < 3000
    ) {
      ttl = +process.env.CF_S3_PRIVATE_URL_EXPIRY_TIME;
    }
  }
  if (bucket === process.env.S3_BUCKET_PRIVATE)
    return await getCfDownloadSignedUrl(
      filePath,
      process.env.CF_S3_PRIVATE_URL!,
      ttl
    );

  if (bucket === process.env.S3_BUCKET_PUBLIC)
    return await getCfDownloadUrl(filePath, process.env.CF_S3_PUBLIC_URL!);
  if (bucket === process.env.S3_BUCKET)
    return await getCfDownloadSignedUrl(filePath, process.env.CF_S3_URL!, ttl);
  throw 'Invalid Bucket';
}

async function moveFile(
  sourceBucket: string,
  sourceFile: string,
  destBucket: string,
  destFile: string
) {
  const input = {
    Bucket: destBucket,
    CopySource: sourceBucket + '/' + sourceFile,
    Key: destFile,
  };
  const command = new CopyObjectCommand(input);
  const response = await s3Client.send(command);
  if (response['$metadata'].httpStatusCode === 200) {
    return destBucket;
  }
  throw new Error('Failed S3 copy');
}

async function getFileData(sourceFile: string, bucketName: string) {
  try {
    logger.debug(
      'Getting content from S3',
      `Bucket: ${bucketName} :: Path:${sourceFile}`
    );
    const command = new GetObjectCommand({
      Key: sourceFile,
      Bucket: bucketName,
    });
    const s3Item = await s3Client.send(command);
    const bodyContents = await streamToString(s3Item.Body as Readable);
    return bodyContents;
  } catch (error) {
    logger.error('', error);
    if (error && (error as {Code: string}).Code === 'NoSuchKey') {
      throw new ResponseError(400, 'File Not Uploaded: ' + sourceFile);
    }
    throw error;
  }
}

async function streamToString(
  readableStream: Readable,
  encoding: BufferEncoding = 'utf8'
) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(Buffer.from(chunk));
  }
  const bodyContents = Buffer.concat(chunks).toString(encoding);
  return bodyContents;
}

async function moveFileFromTemp(
  sourceFile: string,
  destFile: string,
  is_public: boolean
) {
  if (sourceFile.startsWith('/')) {
    sourceFile = sourceFile.substring(1);
  }
  const sourceBucket = process.env.S3_BUCKET_TEMP!;
  let destBucket = process.env.S3_BUCKET_PRIVATE!;
  if (is_public) destBucket = process.env.S3_BUCKET_PUBLIC!;
  logger.debug('moving file from temp bucket to destination bucket', {
    sourceBucket,
    sourceFile,
    destBucket,
    destFile,
  });
  const result = await moveFile(sourceBucket, sourceFile, destBucket, destFile);
  logger.debug(
    'result of moving file from temp bucket to destination bucket',
    result
  );
  if (result) {
    logger.debug('deleting temp file');
    await deleteFile(sourceBucket, sourceFile);
  }
  return result;
}

async function deleteFile(bucket: string, file: string) {
  logger.debug('deleting file', {
    bucket,
    file,
  });
  if (file.startsWith('/')) {
    file = file.substring(1);
  }
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: file,
    })
  );
  logger.debug('file deleted successfully');
}

export {s3Client};
export async function testurlUpload() {
  // const start = new Date().getTime();
  const result = await SaveUrlsToS3(
    true,
    [
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
      'https://source.unsplash.com/user/c_v_r/1900x800',
    ],
    'test/new/'
  );
  // const end = new Date().getTime() - start;
  logger.debug('File save response', result);
  // console.log(end);
}
export async function SaveUrlsToS3(
  is_public: boolean,
  urls: string[],
  path: string
) {
  let i = 1;
  logger.debug('Start Saving Urls', urls);
  let files = urls.map(url => {
    return <FileObject>{
      url: url,
      name: 'ok_testing_file_' + i++ + '.jpg',
      path: path,
    };
  });
  files = await SaveUrlFilesToS3(is_public, files);
  logger.debug('End Saving Urls');
  return files;
}
export async function SaveUrlFilesToS3(
  is_public: boolean,
  files: FileObject[]
) {
  logger.debug('Start Saving All Files', files);
  await Promise.all(
    files.map(async file => {
      if (file.url) {
        try {
          await SaveUrlFileToS3(is_public, file.url, file);
        } catch (error) {
          // logger.error('Unseccessfull uploading to s3', error);
          file.name = undefined;
        }
        delete file.url;
      }
    })
  );
  logger.debug('End Saving All Files');
  return files;
}
export async function SaveUrlFileToS3(
  is_public: boolean,
  url: string,
  new_file: FileObject,
  old_file?: FileObject
) {
  logger.debug('Start Saving Single File', new_file.name);
  const buffer = await downloadAttachment(url);
  if (is_public) new_file.bucket = process.env.S3_BUCKET_PUBLIC!;
  else new_file.bucket = process.env.S3_BUCKET_PRIVATE!;
  await uploadAttachmentToS3(new_file, buffer);
  if (old_file && old_file.bucket)
    await deleteFile(old_file.bucket, old_file.path + '' + old_file.name);
  logger.debug('end Saving Single File');
  return new_file;
}

async function downloadAttachment(url: string) {
  logger.debug('Start Downloading File', url);
  const result = await axios
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then(response => {
      return Buffer.from(response.data, 'base64');
    });
  logger.debug('End Downloading File');
  return result;
}
async function uploadAttachmentToS3(file: FileObject, buffer: Buffer) {
  logger.debug('Start Uploading to s3 ', file.name);
  const uploadParams = {
    Bucket: file.bucket,
    Key: file.path + '' + file.name,
    Body: buffer,
  };
  const data = await s3Client.send(new PutObjectCommand(uploadParams));
  // logger.debug('Success', data);
  if (data.$metadata.httpStatusCode === 200) {
    logger.debug('End Uploading to s3 ');
    return data;
  } else {
    throw 'Unseccessfull uploading to s3';
  }
}
export async function saveFileToS3(
  is_public: boolean,
  buffer: Buffer,
  new_file: FileObject,
  old_file?: FileObject
) {
  logger.debug('Start Saving Single File', new_file.name);
  if (is_public) new_file.bucket = process.env.S3_BUCKET_PUBLIC!;
  else new_file.bucket = process.env.S3_BUCKET_PRIVATE!;
  await uploadAttachmentToS3(new_file, buffer);
  if (old_file && old_file.bucket)
    await deleteFile(old_file.bucket, old_file.path + '' + old_file.name);
  logger.debug('end Saving Single File');
  return new_file;
}

export async function checkFileExistenceInS3(
  is_public: boolean,
  file: FileObject
): Promise<FileObject | undefined> {
  try {
    logger.debug('Getting content from S3', file);
    if (is_public) file.bucket = process.env.S3_BUCKET_PUBLIC!;
    else file.bucket = process.env.S3_BUCKET_PRIVATE!;
    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.path + '' + file.name,
    });
    await s3Client.send(command);
    return file;
  } catch (error) {
    logger.error('GOT ERROR WHILE READING FILE FROM S3', error);
    if (error && (error as {Code: string}).Code === 'NoSuchKey') {
      return;
    }
    throw error;
  }
}

export async function getFileFromS3(
  is_public: boolean,
  file: FileObject
): Promise<string | undefined> {
  try {
    logger.debug('Getting content from S3', file);
    if (is_public) file.bucket = process.env.S3_BUCKET_PUBLIC!;
    else file.bucket = process.env.S3_BUCKET_PRIVATE!;
    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.path + '' + file.name,
    });
    const s3Item = await s3Client.send(command);
    const bodyContents = await streamToString(
      s3Item.Body as Readable,
      'base64'
    );
    return bodyContents;
  } catch (error) {
    logger.error('GOT ERROR WHILE READING FILE FROM S3', error);
    if (error && (error as {Code: string}).Code === 'NoSuchKey') {
      return '';
    }
    throw error;
  }
}
