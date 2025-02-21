import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { storage } from "../../services/appwrite/index.ts";
import { generateControllers } from "../../utils/lib/generator/index.ts";
import { Request, Response } from "express";
import Config from "../../config.ts";
import User, { IUser } from "./model.ts";

const actions = generateControllers(User, "user");

actions.GetMe = async function (req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        const user = await User.findOne({ _id: (req.user as IUser)._id });
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        res.send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

actions.UpdateMe = async function (req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        const user = await User.findOne({ _id: (req.user as IUser)._id });
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.username = req.body.username || user.username;

        const updatedUser = await user.save();
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

actions.UpdateMePassword = async function (req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        const user = await User.findOne({ _id: (req.user as IUser)._id });
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        user.password = req.body.newPassword;
        const updatedUser = await user.save();
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

actions.UpdateMeProfilePicture = async function (req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        const user = await User.findOne({ _id: (req.user as IUser)._id });
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        const profilePicture = req.file;
        if (!profilePicture) {
            res.status(400).send({ message: "Profile picture is required" });
            return;
        }
        profilePicture.originalname = user.id + "." + profilePicture.originalname.split(".").pop();

        const files = await storage.listFiles(Config.appwrite.bucketProfileId);
        const existingFile = files.files.find(file => file.name === profilePicture.originalname);

        if (existingFile) {
            await storage.deleteFile(Config.appwrite.bucketProfileId, existingFile.$id);
        }

        const result = await storage.createFile(
            Config.appwrite.bucketProfileId,
            ID.unique(),
            InputFile.fromBuffer(
                profilePicture.buffer as Buffer,
                profilePicture.originalname,
            )
        );

        if (!result.$id) {
            res.status(500).send({ message: "Profile picture upload failed" });
            return;
        }

        user.profilePicture = `https://cloud.appwrite.io/v1/storage/buckets/${Config.appwrite.bucketProfileId}/files/${result.$id}/preview?project=${Config.appwrite.projectId}`;
        await user.save();

        res.send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

/* export async function DeleteMe(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        const user = await User.findOne({ _id: (req.user as IUser)._id });
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        await user
        res.send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
} */

export { actions };