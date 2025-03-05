export type BlockDeviceInfo = {
  blockdevices: BlockDevice[];
};

export type BlockDevice = {
  name: string;
  size: string;
  type: string;
  mountpoint: string | null;
  vendor: string | null;
  model: string | null;
  children?: BlockDevice[];
};
