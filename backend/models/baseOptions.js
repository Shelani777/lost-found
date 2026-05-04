const baseOptions = {
  timestamps: false,
  versionKey: false,
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
};

module.exports = baseOptions;
