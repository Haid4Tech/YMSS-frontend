export interface Parent {
  id: number;
  userId: number;
}

export interface GetParentResponse {
  students: Array<Parent>;
}

export interface CreateParentProp {
  userId: number;
}
