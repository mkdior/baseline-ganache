import Ident, { IUser, IWorkgroup, IOrganization } from '../models/Ident';
import { CreateQuery, UpdateQuery, DeleteQuery } from 'mongoose';


async function CreateUser({
	createdAt,
	email,
	firstName,
	lastName,
	name,
	permissions,
	privacyPolicyAgreedAt,
	termsOfServiceAgreedAt
}: CreateQuery<IUser>){
	throw new Error('Not implemented!');
}

async function CreateWorkgroup({
	networkId,
	type,
	orgInfoSet,
	config,
	createdAt,
	name,
	userId,
	description
}: CreateQuery<IWorkgroup>){
	throw new Error('Not implemented!');
}

async function CreateOrganization({
	createdAt,
	name,
	userId,
	description,
	metadata
}: CreateQuery<IOrganization>){
	throw new Error('Not implemented!');
}

// Update
async function UpdateUser(){ 
	throw new Error('Not implemented!'); 
}

async function UpdateWorkgroup(){
	throw new Error('Not implemented!');
}

async function UpdateOrganization(){
	throw new Error('Not implemented!');
}

// Delete
async function DeleteUser(){
	throw new Error('Not implemented!');
}

async function DeleteWorkgroup(){
	throw new Error('Not implemented!');
}

async function DeleteOrganization(){
	throw new Error('Not implemented!');
}
