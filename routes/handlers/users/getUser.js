const { User } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "role", "profession", "avatar"],
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "user not found",
      });
    }

    return res.json({
      status: "success",
      data: user,
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
