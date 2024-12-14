import mongoose, { Schema } from "mongoose";
import User, { IUser } from "../../../api/users/model.ts";
import connectToDatabase from "../mongo.ts";
import { generalLogger } from "../../logger/winston.ts";
import { UsersRoleEnum } from "../../../utils/enum.ts";

const seedData = async () => {
  try {
    await connectToDatabase();

    await User.deleteMany({});
    generalLogger.info("Cleared existing data.");

    const userDatas: Partial<IUser>[] = [
      { username: "admin", email: "admin@admin.com", firstName: "admin", lastName: "admin", password: "adminadmin", role: UsersRoleEnum.ADMIN, isActive: true },
      { username: "user", email: "user@user.com", firstName: "user", lastName: "user", password: "useruser", role: UsersRoleEnum.USER, isActive: true },
    ];

    for(const userData of userDatas) {
      const user = new User({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        role: userData.role,
        isActive: userData.isActive,
      });
      const newUser = await user.save();
      userDatas[userDatas.indexOf(userData)] = newUser;
    }
    generalLogger.info("Users seeded.");

    generalLogger.info("Database disconnected. Seed process complete!");
    await mongoose.connection.close();
    process.exit(1);
  } catch (error) {
    generalLogger.error("Error seeding data:", error);
  }
};

seedData();
