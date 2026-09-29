import { Router } from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserByMail, findUserById } from "../repositories/userRepository";
import jwt from "jsonwebtoken";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async(req, res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({
            error: "Name, email and password are required"
        });
    }

    const existingUser = await findUserByMail(email);

    if(existingUser) {
        return res.status(400).json({
            error: "Email already registered"
        });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser(name, email, passwordHash);
    const {
        passwordHash: _passwordHash,
        ...safeUser
    } = user;

    return res.status(201).json(safeUser);
});


router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        });
    }

    const user = await findUserByMail(email);

    if(!user) {
        return res.status(401).json({
            error: "Invalid credentials"
        });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
        return res.status(401).json({
            error: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        {userId: user.id},
        process.env.JWT_SECRET!,
        {expiresIn: "1h"}
    );

    return res.status(200).json({
        accessToken: token
    });
});

router.get("/me", authenticate, async(req: AuthenticatedRequest, res) => {
    const user = await findUserById(req.userId!);

    if(!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }
    return res.status(200).json(user);
});

export default router;
