import * as tagRepository from './tag.repository'
import {getSession} from "../../utils/db";
import {respondSuccess} from "../../helpers/response";

export const getTags = async (req, res) => {

  const tags = await tagRepository.getTags(getSession(req), req.query.name)
  return respondSuccess(res, tags, 200)
}
