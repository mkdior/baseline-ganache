import {
  IUser,
  IWorkgroup,
  IOrganization,
  organizationSchema,
  userSchema,
  workgroupSchema,
} from "../models/Ident";
import { CreateQuery, UpdateQuery, Connection, Model } from "mongoose"; //, DeleteQuery } from 'mongoose';

interface ObjectType {
  OrganizationModel: Model<IOrganization>;
  UserModel: Model<IUser>;
  WorkgroupModel: Model<IWorkgroup>;
}

export class IdentWrapper {
  IdentConnection: any;
  IdentTables: ObjectType;

  constructor(c: Connection) {
    this.IdentConnection = c;
    this.IdentTables = {
      OrganizationModel: c.model<IOrganization>(
        "organization",
        organizationSchema as any,
      ),
      UserModel: c.model<IUser>("user", userSchema as any),
      WorkgroupModel: c.model<IWorkgroup>("workgroup", workgroupSchema as any),
    };
  }

  public async createUser(userData: CreateQuery<IUser>): Promise<IUser> {
    return this.IdentTables.UserModel.create(userData)
      .then((user: IUser) => {
        return user;
      })
      .catch((e: Error) => {
        throw e;
      });
  }

  public async createWorkgroup(
    workgroupData: CreateQuery<IWorkgroup>,
  ): Promise<IWorkgroup> {
    return this.IdentTables.WorkgroupModel.create(workgroupData)
      .then((workgroup: IWorkgroup) => {
        return workgroup;
      })
      .catch((e: Error) => {
        throw e;
      });
  }

  public async createOrganization(
    orgData: CreateQuery<IOrganization>,
  ): Promise<IOrganization> {
    return this.IdentTables.OrganizationModel.create(orgData)
      .then((organization: IOrganization) => {
        return organization;
      })
      .catch((e: Error) => {
        throw e;
      });
  }

  // Update
  public async updateUser() {
    throw new Error("Not implemented!");
  }

  public async updateWorkgroup() {
    throw new Error("Not implemented!");
  }

  public async updateOrganization() {
    throw new Error("Not implemented!");
  }

  // Delete
  //public async DeleteUser(){
  //	throw new Error('Not implemented!');
  //}
  //
  //public async DeleteWorkgroup(){
  //	throw new Error('Not implemented!');
  //}
  //
  //public async DeleteOrganization(){
  //	throw new Error('Not implemented!');
  //}
}
