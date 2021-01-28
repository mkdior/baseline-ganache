import { IUser, IWorkgroup, IOrganization, organizationSchema, userSchema, workgroupSchema } from '../models/Ident';
import { CreateQuery, UpdateQuery, Connection, Model } from 'mongoose'; //, DeleteQuery } from 'mongoose';

interface ObjectType {
	OrganizationModel: Model<IOrganization>;
	UserModel: Model<IUser>;
	WorkgroupModel: Model<IWorkgroup>;
};

export class IdentWrapper {
	IdentConnection: any;
	IdentTables: ObjectType;

	constructor(c: Connection) {
		this.IdentConnection = c;
		this.IdentTables = {	
			OrganizationModel :  c.model<IOrganization>('organization', (organizationSchema as any)),
			UserModel :  c.model<IUser>('user', (userSchema as any)),
			WorkgroupModel : c.model<IWorkgroup>('workgroup', (workgroupSchema as any))
		};
	}

	public async createUser({
		createdAt,
		email,
		firstName,
		lastName,
		name,
		permissions,
		privacyPolicyAgreedAt,
		termsOfServiceAgreedAt
	}: CreateQuery<IUser>): Promise<IUser>{
		return this.IdentTables.UserModel.create({
			createdAt,
			email,
			firstName,
			lastName,
			name,
			permissions,
			privacyPolicyAgreedAt,
			termsOfServiceAgreedAt
		})
			.then((user: IUser) => {return user;})
			.catch((e: Error) => {throw e;});
		
	}

	public async createWorkgroup({
		networkId,
		type,
		orgInfoSet,
		config,
		createdAt,
		name,
		userId,
		description
	}: CreateQuery<IWorkgroup>): Promise<IWorkgroup>{
		return this.IdentTables.WorkgroupModel.create({
			networkId,
			type,
			orgInfoSet,
			config,
			createdAt,
			name,
			userId,
			description
		}).then((workgroup: IWorkgroup) => {return workgroup;}).catch((e: Error) => {throw e;});
	}

	public async createOrganization({
		createdAt,
		name,
		userId,
		description,
		metadata
	}: CreateQuery<IOrganization>): Promise<IOrganization>{
		return this.IdentTables.OrganizationModel.create({
			createdAt,
			name,
			userId,
			description,
			metadata
		}).then((organization: IOrganization) => {return organization;}).catch((e: Error) => {throw e});
	}

	// Update
	public async updateUser(){ 
		throw new Error('Not implemented!'); 
	}

	public async updateWorkgroup(){
		throw new Error('Not implemented!');
	}

	public async updateOrganization(){
		throw new Error('Not implemented!');
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
