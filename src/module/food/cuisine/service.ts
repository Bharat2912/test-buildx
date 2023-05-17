import Globals from '../../../utilities/global_var/globals';
import {
  FileObject,
  generateDownloadFileURL,
} from '../../../utilities/s3_manager';
import {ICuisine, readActiveCusineByIds} from './models';

export async function getPopularCuisinesByCity(): Promise<
  {
    id: string;
    name: string;
    image: FileObject;
  }[]
> {
  const popular_cuisine_ids = await Globals.POPULAR_CUISINE_IDS.get();
  const cuisines = await readActiveCusineByIds(popular_cuisine_ids);
  await setCuisinesDownloadURL(cuisines);
  return cuisines;
}

export async function setCuisineDownloadURL(cuisine: ICuisine) {
  if (
    cuisine.image &&
    cuisine.image.bucket &&
    cuisine.image.path &&
    cuisine.image.name
  ) {
    cuisine.image = await generateDownloadFileURL(cuisine.image);
  } else {
    cuisine.image = {url: await Globals.CUISINE_DEFAULT_IMAGE.get()};
  }
}

export async function setCuisinesDownloadURL(cuisines: ICuisine[]) {
  for (let i = 0; i < cuisines.length; i++) {
    await setCuisineDownloadURL(cuisines[i]);
  }
}
