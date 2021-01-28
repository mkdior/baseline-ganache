import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
	createdAt: Date;
	name: string;
	userId: string;
	description: string;
	metadata: {
		messaging_endpoint: string;
	};
};

export interface IUser extends Document {
	createdAt: Date;
	email: string;
	firstName: string;
	lastName: string;
	name: string;
	permissions: [
		{
			permission: string
		}
	];
	privacyPolicyAgreedAt: string;
	termsOfServiceAgreedAt: string;
};

export interface IWorkgroup extends Document {
	networkId: string;
	type: string;
	orgInfoSet: {
		organization: Schema.Types.ObjectId,
			users: [Schema.Types.ObjectId]
	};
	config: {
		webhookSecret: string
	};
	createdAt: Date;
	name: string;
	userId: string;
	description: string;
};

export const organizationSchema: Schema = new Schema({
	createdAt: {
		type: Date,
		default: Date.now
	},
	name: String,
	userId: String,
	description: String,
	metadata: {
		messaging_endpoint: String
	}
});

export const userSchema: Schema = new Schema({
	createdAt: {
		type: Date,
		default: Date.now
	},
	email: String,
	firstName: String,
	lastName: String,
	name: String,
	permissions: [{
		permission: String
	}],
	privacyPolicyAgreedAt: {
		type: Date,
		default: null
	},
	termsOfServiceAgreedAt: {
		type: Date,
		default: null
	},
});

export const workgroupSchema: Schema = new Schema({
	networkId: String,
	type: String,
	orgInfoSet: {
		organization: Schema.Types.ObjectId,
		users: [Schema.Types.ObjectId]
	},
	config: {
		webhook_secret: String
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	name: String,
	userId: String,
	description: String,
});
