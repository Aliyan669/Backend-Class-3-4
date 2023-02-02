const { response } = require("express");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const userModel = require("./modules/user");
const DBURI = "mongodb+srv://aliyan:aliyan@cluster0.6ytuali.mongodb.net/test";
var bcrypt = require("bcryptjs");

mongoose
  .connect(DBURI)
  .then((res) => console.log("mongo db Connect"))
  .catch((err) => console.log("DB Error", err));

///  Body Parser ///
app.use(express.json());
////////////////

//// User Signup Api /////
app.post("/api/signup", (request, response) => {
  console.log(request.body);
  const { firstName, lastName, email, password, mobileNumber, dob } =
    request.body;

  if (!firstName || !lastName || !email || !password || !mobileNumber || !dob) {
    response.json({
      message: "Required fields are missings",
      status: false,
    });
    return;
  }
  const hashPassword = bcrypt.hashSync(password, 10);
  const objToSend = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: hashPassword,
    mobile_number: mobileNumber,
    dob: dob,
  };
  userModel.findOne({ email: email }, (error, user) => {
    if (error) {
      response.json({
        message: "Internal server error",
        status: false,
      });
    } else {
      console.log(user, "user");
      if (user) {
        response.json({
          message: "Email Address Already Exists",
          status: false,
        });
      } else {
        userModel.create(objToSend, (error, user) => {
          if (error) {
            response.json({
              message: "Internal server error",
              status: false,
            });
          } else {
            response.send({
              message: "User Successfully Signup",
              status: true,
              user,
            });
          }
        });
      }
    }
  });
});
//// User Login Api /////
app.post("/api/login", (request, response) => {
  const { email, password } = request.body;
  if (!email, !password) {
    response.json({
      message: "Required fields are missings",
      status: false,
    });
    return;
  }
  userModel.findOne({ email: email }, (error, user) => {
    if (error) {
      response.json({
        message: "Internal server error",
        status: false,
      });
      return;
    } else {
      if (!user) {
        response.json({
          message: "Credential Error",
          status: false,
        });
        return;
      } else {
        const comparePassword = bcrypt.compareSync(password, user.password);
        if (comparePassword) {
          response.json({
            message: "user Successfully Login",
            status: true,
            user,
          });
        } else {
          response.json({
            message: "Credential Error",
            status: false,
          });
        }
      }
    }
  });
});

//// Single User Get Api /////
app.get("/api/user/:userid", (request, response) => {
  // response.send("Get User")
  console.log(request.params, "params");

  const { userid } = request.params;

  console.log(userid, " userID");

  userModel.findById(userid, (error, data) => {
    if (error) {
      response.json({
        message: `Internal error: ${error}`,
        status: false,
      });
    } else {
      response.json({
        message: "User Successfully Get",
        data: data,
        status: true,
      });
    }
  });
});

//// User Create Api /////
app.post("/api/user", (request, response) => {
  console.log(request.body);
  // response.send("Create User")

  const { firstName, lastName, email, password } = request.body;

  if (!firstName || !lastName || !email || !password) {
    response.json({
      message: "Requireds Field are Missing",
      status: false,
    });
  }
  const objToSend = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: password,
  };

  userModel.create(objToSend, (error, data) => {
    if (error) {
      response.json({
        message: `Internal error: ${error}`,
        status: false,
      });
    } else {
      response.json({
        message: "User Successfully Create",
        data: data,
        status: true,
      });
    }
  });
});

app.put("/api/user", (request, response) => {
  response.send("Update User");
});

app.delete("/api/user", (request, response) => {
  response.send("Delete User");
});

app.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
