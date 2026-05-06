import jwt from "jsonwebtoken";
export const protect = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided. Access denied.",
        });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.sendStatus(401);
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({ message: "JWT_SECRET is not set" });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(403).json({
            message: "Invalid token. Access denied.",
        });
    }
};
