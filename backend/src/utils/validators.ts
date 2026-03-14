// Backend comment: validators
import Joi from 'joi';

export const validateRegister = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'worker').required()
  });

  return schema.validate(data);
};

export const validateLogin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

export const validateWorkerKYC = (data: any) => {
  const schema = Joi.object({
    profession: Joi.string().valid('plumber', 'electrician', 'carpenter', 'painter', 'cleaner').required(),
    experience: Joi.number().min(0).max(50).required()
  });

  return schema.validate(data);
};

export const validateBooking = (data: any) => {
  const schema = Joi.object({
    workerId: Joi.string().required(),
    profession: Joi.string().valid('plumber', 'electrician', 'carpenter', 'painter', 'cleaner').required(),
    description: Joi.string().allow('').optional(),
    location: Joi.object({
      address: Joi.string().allow('').optional(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required()
  });

  return schema.validate(data);
};
