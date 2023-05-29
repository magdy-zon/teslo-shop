import {v4 as uuid} from 'uuid';

export const fileFilter = (
  req: Express.Request, 
  file: Express.Multer.File, 
  callback: Function
) => {
  if (!file) 
  return callback(
    new Error('File is empty'), 
    false
  );

  const fileExtension = 
    file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  
  if(validExtensions.includes(fileExtension))
    return callback(null, true);

  const fileName = `${uuid()}.${fileExtension}`


  callback(null, fileName);

}