import Message from '../models/Message.js';
import Group from '../models/Group.js';

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    await Message.updateMany(
      { sender: userId, receiver: req.user._id, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load conversation.', error: error.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group || !group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a group member.' });
    }

    const messages = await Message.find({ group: groupId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email');

    await Message.updateMany(
      { group: groupId, sender: { $ne: req.user._id }, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load group messages.', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiver, groupId, message } = req.body;

    if (!message || (!receiver && !groupId)) {
      return res.status(400).json({ message: 'Message and target are required.' });
    }

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group || !group.members.some((m) => m.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Not allowed in this group.' });
      }

      const newMessage = await Message.create({
        sender: req.user._id,
        group: groupId,
        message,
        seenBy: [req.user._id]
      });

      const populated = await newMessage.populate('sender', 'name email');
      return res.status(201).json(populated);
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver,
      message,
      seenBy: [req.user._id]
    });

    const populated = await newMessage.populate('sender receiver', 'name email');
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send message.', error: error.message });
  }
};
