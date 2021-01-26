import Ident, { IUser, IWorkgroup, IOrganization } from '../models/Ident';
import { CreateQuery, UpdateQuery, DeleteQuery } from 'mongoose';


export async function CreateUser({
	createdAt,
	email,
	firstName,
	lastName,
	name,
	permissions,
	privacyPolicyAgreedAt,
	termsOfServiceAgreedAt
}: CreateQuery<IUser>): Promise<IUser>{
	return Ident.UserModel.create({
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

export async function CreateWorkgroup({
	networkId,
	type,
	orgInfoSet,
	config,
	createdAt,
	name,
	userId,
	description
}: CreateQuery<IWorkgroup>): Promise<IWorkgroup>{
	Ident.WorkgroupModel.create({
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

export async function CreateOrganization({
	createdAt,
	name,
	userId,
	description,
	metadata
}: CreateQuery<IOrganization>): Promise<IOrganization>{
	Ident.OrganizationModel.create({
		createdAt,
		name,
		userId,
		description,
		metadata
	}).then((organization: IOrganization) => {return organization;}).catch((e: Error) => {throw e});
}

// Update
export async function UpdateUser(){ 
	throw new Error('Not implemented!'); 
}

export async function UpdateWorkgroup(){
	throw new Error('Not implemented!');
}

export async function UpdateOrganization(){
	throw new Error('Not implemented!');
}

// Delete
export async function DeleteUser(){
	throw new Error('Not implemented!');
}

export async function DeleteWorkgroup(){
	throw new Error('Not implemented!');
}

export async function DeleteOrganization(){
	throw new Error('Not implemented!');
}
