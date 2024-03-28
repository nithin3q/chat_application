import bcrypt from "bcrypt"
import UserModel from "../Models/UserModels.js";
export const registerUser = async(req,res)=>{
    const {username,password,firstname,lastname}=req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt)
    const newUser = new UserModel({
        username,
        password:hashedPassword,
        firstname,
        lastname
    })
    try {
        await newUser.save()
        res.status(200).json(newUser)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}
export const loginUser = async (req, res) => {
    const {username,password}=req.body;
    try {
        const user =await UserModel.findOne({ username });
      if (user) {
        const validity =await bcrypt.compare(password, user.password);
        if (validity) {
            res.status(200).json(user)
        } else {
          res.status(400).json("Wrong Username or Password");
        }
      } else {
          res.status(404).json("user not found");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  export const logoutUser = async (req, res) => {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been logged out");
  }
  export const signOutUser = async (req, res) => {
  try {
    // Destroy the session to sign the user out
    req.session.destroy((err) => {
      if (err) {
        throw new Error('Unable to sign out.');
      }

      res.clearCookie('connect.sid'); // Clear the session cookie

      res.status(200).send({ message: 'Successfully signed out.' });
    });
  } catch (error) {
    res.status(500).send({ error: 'Unable to sign out.' });
  }
};
