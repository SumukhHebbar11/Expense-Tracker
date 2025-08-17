import FamilyMember from "../models/FamilyMember.js";

export const listFamilyMembers = async (req, res) => {
  try {
    const members = await FamilyMember.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, members });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching family members" });
  }
};

export const addFamilyMember = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const member = await FamilyMember.create({
      userId: req.user._id,
      name: name.trim(),
    });
    res.status(201).json({ success: true, member });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while creating family member" });
  }
};

export const updateFamilyMember = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const member = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!member)
      return res.status(404).json({ message: "Family member not found" });

    member.name = name.trim();
    await member.save();

    res.json({ success: true, member });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while updating family member" });
  }
};

export const deleteFamilyMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!member)
      return res.status(404).json({ message: "Family member not found" });

    await FamilyMember.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Family member deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while deleting family member" });
  }
};
