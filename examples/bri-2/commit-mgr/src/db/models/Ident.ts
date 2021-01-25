import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
	_id: string;
	createdAt: Date;
	name: string;
	userId: string;
	description: string;
	metadata: {
		messaging_endpoint: string;
	};
};

export interface IUser extends Document {
	_id: string;
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
	_id: string;
	networkId: string;
	type: string;
	orgInfoSet: {
		organization: IOrganization,
			users: [IUser]
	};
	config: {
		webhookSecret: string
	};
	createdAt: Date;
	name: string;
	userId: string;
	description: string;
};

const organizationSchema = new Schema({
	_id: String,
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

const userSchema = new Schema({
	_id: String,
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

const workgroupSchema = new Schema({
	_id: String,
	networkId: String,
	type: String,
	orgInfoSet: {
		organization: organizationSchema,
		users: [userSchema]
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

export default mongoose.model<IOrganization>('organization', organizationSchema);
//export default {
//	org: mongoose.model<IOrganization>('organization', organizationSchema), 
//	user: mongoose.model<IUser>('user', userSchema), 
//	workgroup: mongoose.model<IWorkgroup>('workgroup', workgroupSchema)
//};
