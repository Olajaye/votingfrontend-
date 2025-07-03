export interface User {
  id: string;
  email: string;
  token: string;
}

export interface RoomType {
  id: string;
  uniqueId: string;
  title: string;
  description: string;
  deadline: string;
  options: Option[];
}

export interface Option {
  id: string;
  text: string;
  voteCount: number;
}