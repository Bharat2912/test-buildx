import * as map from '../../internal/map';

export function mockGetMatrix(table_length: number) {
  const distances: number[][] = [];
  const durations: number[][] = [];
  const destinations: {
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }[] = [];
  const sources: {
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }[] = [];

  for (let i = 0; i < table_length; i++) {
    distances.push([2978.4]);
    durations.push([756.7]);
    destinations.push({
      hint: 'k76wgaG-sIEbAAAAUQAAAAAAAACLBAAAQtk4Qa8aDkEAAAAAv1EBQxsAAABRAAAAAAAAAIsEAAAaAAAAecdSBHHAXwGLx1IE_cBfAQAADwbVkHCy',
      distance: 15.612912,
      name: '',
      location: [72.533881, 23.052401],
    });
    sources.push({
      hint: 'XZ6wgSXfKICJAAAAGwAAAAAAAACAAQAAfg5lQl7SMEEAAAAA0cUfQ4kAAAAbAAAAAAAAAIABAAAaAAAAFQZTBK7qXwFIBlMEjOpfAQAAPwLVkHCy',
      distance: 6.44095,
      name: '',
      location: [72.549909, 23.063214],
    });
  }

  const mock_function = jest.spyOn(map, 'getMapMatrix');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        distances: distances,
        durations: durations,
        destinations: destinations,
        sources: sources,
      });
    })
  );
  return mock_function;
}
