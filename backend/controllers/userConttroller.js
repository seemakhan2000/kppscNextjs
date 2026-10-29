
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    const { name, gender, cnic, district, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !gender || !cnic || !district || !email || !password) {
      return res.status(400).json({
        success: false,
        field: "form",
        message: "Please complete all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCNIC = cnic.trim();

    // 2. Check existing email
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        field: "email",
        message:
          "This email address is already registered. Please log in or use a different email address.",
      });
    }

    // 3. Check existing CNIC
    const existingCNIC = await User.findOne({
      cnic: normalizedCNIC,
    });

    if (existingCNIC) {
      return res.status(409).json({
        success: false,
        field: "cnic",
        message:
          "This CNIC is already registered. Please log in to your existing account.",
      });
    }

    // 4. Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user
    const newUser = new User({
      name: name.trim(),
      gender,
      cnic: normalizedCNIC,
      district,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 6. Save to MongoDB
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Your account has been created successfully. Please log in.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate-key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "email") {
        return res.status(409).json({
          success: false,
          field: "email",
          message:
            "This email address is already registered. Please log in or use a different email address.",
        });
      }

      if (duplicateField === "cnic") {
        return res.status(409).json({
          success: false,
          field: "cnic",
          message:
            "This CNIC is already registered. Please log in to your existing account.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "An account with these details already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "We could not create your account right now. Please try again later.",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { cnic, password } = req.body;

    if (!cnic || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your CNIC and password.",
      });
    }

    const user = await User.findOne({
      cnic: cnic.trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid CNIC or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid CNIC or password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        cnic: user.cnic,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in right now. Please try again later.",
    });
  }
};
