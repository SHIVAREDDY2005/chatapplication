import Group from '../models/Group.js';
import Message from '../models/Message.js';

export const createGroup = async (req, res) => {
  try {
    const { name, members = [] } = req.body;

    if (!name || members.length === 0) {
      return res.status(400).json({ message: 'Group name and members are required.' });
    }

    const uniqueMembers = [...new Set([...members, req.user._id.toString()])];

    const group = await Group.create({
      name,
      members: uniqueMembers,
      createdBy: req.user._id
    });

    return res.status(201).json(group);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create group.', error: error.message });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate('members', 'name email lastSeen');

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          group: { $ne: null },
          seenBy: { $ne: req.user._id },
          sender: { $ne: req.user._id }
        }
      },
      {
        $group: {
          _id: '$group',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = unreadCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    return res.json(
      groups.map((group) => ({
        ...group.toObject(),
        unreadCount: unreadMap[group._id.toString()] || 0
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch groups.', error: error.message });
  }
};
