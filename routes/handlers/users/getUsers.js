const { User } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const userIds = req.query.user_ids || [];

    const sqlOptions = {
      attributes: ["id", "name", "email", "role", "profession", "avatar"],
    };

    if (userIds.length) {
      sqlOptions.where = {
        id: userIds,
      };
    }

    const users = await User.findAll(sqlOptions);

    return res.json({
      status: "success",
      data: users,
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
