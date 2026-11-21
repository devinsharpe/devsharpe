export interface PhotoCollection {
  id: string;
  name: string;
  description: string;
  body: string;
  photo_ids: Array<string>;
  preview_ids: Array<string>;
  published_at: string; // ISO Date String
}

export interface Photo {
  id: string;
  src: string;
  location: string;
  published_at: string; // ISO Date String
}
