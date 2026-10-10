import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const userSeed = async () => {
  try {
    const defaultPassword = await bcrypt.hash("Manager@123", 10);
    const UserData = [
      {
        fullName: "Manager1",
        email: "manager1@gmail.com",
        password: defaultPassword,
        dob: "2000-01-01",
        gender: "other",
        userType: "restaurant",
        phone: "9876543210",
        photo: { url: "https://placehold.co/600x400?text=M1", publicId: null },
      },
      {
        fullName: "Manager2",
        email: "manager2@gmail.com",
        password: defaultPassword,
        dob: "2000-01-01",
        gender: "other",
        userType: "restaurant",
        phone: "9876543211",
        photo: { url: "https://placehold.co/600x400?text=M2", publicId: null },
      },
      {
        fullName: "Manager3",
        email: "manager3@gmail.com",
        password: defaultPassword,
        dob: "2000-01-01",
        gender: "other",
        userType: "restaurant",
        phone: "9876543212",
        photo: { url: "https://placehold.co/600x400?text=M3", publicId: null },
      },
      {
        fullName: "Manager4",
        email: "manager4@gmail.com",
        password: defaultPassword,
        dob: "2000-01-01",
        gender: "other",
        userType: "restaurant",
        phone: "9876543213",
        photo: { url: "https://placehold.co/600x400?text=M4", publicId: null },
      },
      {
        fullName: "Manager5",
        email: "manager5@gmail.com",
        password: defaultPassword,
        dob: "2000-01-01",
        gender: "other",
        userType: "restaurant",
        phone: "9876543214",
        photo: { url: "https://placehold.co/600x400?text=M5", publicId: null },
      },
      {
        fullName: "Customer1",
        email: "customer1@gmail.com".toLowerCase(),
        password: await bcrypt.hash("Customer@123", 10),
        dob: "2000-01-01",
        gender: "other",
        userType: "customer",
        phone: "9876543210",
        photo: { url: "https://placehold.co/600x400?text=C", publicId: null },
      },
      {
        fullName: "Rider1",
        email: "rider1@gmail.com".toLowerCase(),
        password: await bcrypt.hash("Rider@123", 10),
        dob: "2000-01-01",
        gender: "other",
        userType: "rider",
        phone: "9876543210",
        photo: { url: "https://placehold.co/600x400?text=R", publicId: null },
      },

      {
        fullName: "admin1",
        email: "admin1@gmail.com".toLowerCase(),
        password: await bcrypt.hash("Admin@123", 10),
        dob: "2000-01-01",
        gender: "male",
        userType: "admin",
        phone: "9876543210",
        photo: { url: "https://placehold.co/600x400?text=A", publicId: null },
      },
    ];

    for (const user of UserData) {
      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        console.log(`Existing ${user.userType} Found`);
        await existingUser.deleteOne();
      }

      await User.create(user);
      console.log(`${user.userType} Created Successfully`);
    }
  } catch (error) {
    console.log("User Not Created");
    throw error;
  }
};

export default userSeed;
