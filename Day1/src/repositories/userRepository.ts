import { db } from "../prisma/db";

export async function createUser(
    name: string,
    email: string,
    passwordHash: string
) {
    return await db.orm.public.Users.create({
        name, email, passwordHash
    });
}

export async function findUserByMail(email: string) {
    return await db.orm.public.Users.select(
        "id", "name", "email", "passwordHash", "createdAt"
    )
    .where( { email })
    .first();
}

export async function findUserById(id: number) {
    return await db.orm.public.Users.select(
        "id", "name", "email", "createdAt"
    )
    .where( { id })
    .first();
}
