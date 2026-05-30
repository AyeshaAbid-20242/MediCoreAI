import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
const cnicRegex = /^[0-9-]{13,15}$/;
const urlRegex = /^https?:\/\/.+\..+/i;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const trimString = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : email;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidEmail = (email) =>
  typeof email === "string" && emailRegex.test(email.trim());

const isStrongPassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toStringArray = (value) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return null;

  return value
    .map((item) => trimString(item))
    .filter((item) => typeof item === "string" && item.length > 0);
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return Boolean(value);
};

const isValidDate = (value) => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime());
};

const isFutureDate = (value) => {
  if (!isValidDate(value)) return false;
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date >= new Date();
};

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: errors[0] || "Please provide valid input.",
    errors,
  });

export {
  cnicRegex,
  isFutureDate,
  isStrongPassword,
  isValidDate,
  isValidEmail,
  isValidObjectId,
  normalizeEmail,
  phoneRegex,
  sendValidationError,
  timeRegex,
  toBoolean,
  toNumber,
  toStringArray,
  trimString,
  urlRegex,
};
