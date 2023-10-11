const { User, RefreshToken } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const userId = req.body.user_id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "user not found",
      });
    }

    await RefreshToken.destroy({
      where: { user_id: userId },
    });

    return res.json({
      status: "success",
      data: "refresh token deleted",
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
