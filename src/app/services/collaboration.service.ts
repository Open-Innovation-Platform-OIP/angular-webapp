import { Injectable } from '@angular/core';

export interface collaborator {
  intent: String;
  roles: {
    ngo: boolean;
    innovator: boolean;
    entrepreneur: boolean;
    expert: boolean;
    government: boolean;
    beneficiary: boolean;
    incubator: boolean;
    funder: boolean;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {

  constructor() { }
}
