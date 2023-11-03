import mongoose, { Model, Document } from "mongoose";

interface IUser extends Document {
  teamName: string;
  password: string;
  profitLoss: string;
  description: string;
  totalMoney: string;
  createdAt: Date;
  // Define other properties here
}

const userSchema = new mongoose.Schema<IUser>({
  teamName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profitLoss: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  totalMoney: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Define other properties here
});



let User: Model<IUser>;

if (mongoose.models.User) {
  User = mongoose.model<IUser>("User");
} else {
  User = mongoose.model<IUser>("User", userSchema);
}

export { User };
