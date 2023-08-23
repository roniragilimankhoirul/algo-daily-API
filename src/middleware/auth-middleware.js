import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  const invalidMsg = "Invalid token";
  const secret =
    "CoAmswhTKX+W4/I2einL3kIrTQ8nAHny902dTJO1n3JJ2EmQci2Cs5QedkHwEsgW+SSEYBmCN4YZbh9e0KfZ3Q==";
  if (!token) return res.status(498).json({ message: invalidMsg });

  jwt.verify(token, secret, (err, decodeToken) => {
    if (err) return res.status(498).json({ message: invalidMsg });
    req.decodedToken = decodeToken;
    next();
  });
};

export { requireAuth };
