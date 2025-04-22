export interface Image {
  id: string;
  name: string;
  url: string;
  pathname: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: number;
  tags?: string[];
}