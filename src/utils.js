
module.exports = {
  errStr : errStr
};

function errStr(code)
{
  switch(code)
  {
    case 0:
      return "OK";
      break;
    case -1:
      return "NOT_OWNER"
      break;
    case -2:
      return "NO_PATH"
      break;
    case -3:
      return "NAME_EXISTS"
      break;
    case -4:
      return "BUSY"
      break;
    case -5:
      return "NOT_FOUND"
      break;
    case -6:
      return "NOT_ENOUGH_ENERGY"
      break;
    case -6:
      return "NOT_ENOUGH_RESOURCES"
      break;
    case -7:
      return "INVALID_TARGET"
      break;
    case -8:
      return "FULL"
      break;
    case -9:
      return "NOT_IN_RANGE"
      break;
    case -10:
      return "INVALID_ARGS"
      break;
    case -11:
      return "TIRED"
      break;
    case -12:
      return "NO_BODYPART"
      break;
    case -6:
      return "NOT_ENOUGH_EXTENSIONS"
      break;
    case -14:
      return "RCL_NOT_ENOUGH"
      break;
    case -15:
      return "GCL_NOT_ENOUGH"
      break;
    default:
      return "!ERR-CODE!"
      break;
  }
}