const bcrypt = require("bcrypt");
const { User } = require("../../../models");
const Validator = require("fastest-validator");
const v = new Validator();
const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  JWT_SECRET_REFRESH_TOKEN,
  JWT_ACCESS_TOKEN_EXPIRED,
  JWT_REFRESH_TOKEN_EXPIRED,
} = process.env;

module.exports = async (req, res) => {
  try {
    const schema = {
      email: "email|empty:false",
      password: "string|min:8",
    };

    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const user = await User.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "user not found",
      });
    }

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(404).json({
        status: "error",
        message: "user not found",
      });
    }

    const data = user.data.data;

    const token = jwt.sign({ data }, JWT_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRED,
    });
    const refreshToken = jwt.sign({ data }, JWT_SECRET_REFRESH_TOKEN, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRED,
    });

    await api.post("/refresh_tokens", {
      refresh_token: refreshToken,
      user_id: data.id,
    });

    return res.json({
      status: "success",
      data: {
        token,
        refresh_token: refreshToken,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res
        .status(500)
        .json({ status: "error", message: "service unavailable" });
    }

    const { status, data } = error.response;
    return res.status(status).json(data);
  }
};
