const express = require('express')
const path = require("path");
const md5 = require("md5");
const multer = require("multer");

const router = require('express').Router();
const randomstring = require('randomstring');
const fs = require("fs");


/**
 * 사용자 파일 업로드
 */
router.post('/attaches', async (req, res) => {


    // 업로드 허용 확장자
    const allowExt = [".csv", ".psd", ".pdf", ".ai", ".eps", ".ps", ".smi", ".xls", ".ppt", ".pptx",".gz", ".gzip", ".tar", ".tgz", ".zip", ".rar", ".bmp", ".gif", ".jpg", ".jpe",".jpeg", ".png", ".tiff", ".tif", ".txt", ".text", ".rtl", ".xml", ".xsl",".docx", ".doc", ".dot", ".dotx", ".xlsx", ".word", ".srt",".webp"];

    // 이미지 파일 확장자
    const imageExt = [".gif",".jpg",".jpe",".jpeg",".png",".tiff",".tif",".webp"]

    // 업로드 경로를 계산합니다.
    // 업로드 경로는 app/data/uploads/년도/월 이 됩니다
    const yearMonth = path.posix.join((new Date().getFullYear()).toString() , (new Date().getMonth() + 1).toString());
    const directory = path.join('data','uploads',yearMonth);    // 루트 디렉토리를 기준으로 업로드 경로
    const uploadPath = path.join(root, 'data', 'uploads', yearMonth);   // 루트 디렉토리를 포함한 업로드 경로

    // multer 미들웨어 설정
    const upload = multer({
        dest: uploadPath,
    }).array('userfile'); // 파일 필드의 이름을 지정

    // 디렉토리가 존재하지 않는다면, 디렉토리를 생성합니다.
    try {
        if (!fs.existsSync(uploadPath)) {
            // 디렉토리가 없는 경우 생성
            fs.mkdirSync(uploadPath, { recursive: true });
        }
    } catch (err) {
        console.error('디렉토리 생성 중 에러 발생:', err);
        return res.status(500).json({ error: 'Failed to create directory' });
    }

    const resultArray = [];

    // multer 미들웨어 실행
    upload(req, res, async (err) => {
        if (err) {
            console.error('파일 업로드 중 에러 발생:', err);
            return res.status(500).json({ error: '파일 업로드 실패' });
        }

        req.files.map(async (file) => {
            const ext = path.extname(file.originalname).toLowerCase(); // 파일의 원본이름에서 확장자를 구합니다.
            const originalName = file.originalname;             // 파일의 원본명은 따로 저장해둡니다.

            // 업로드 허용 확장자인지 체크합니다.
            if( allowExt.indexOf(ext) < 0) {
                return res.status(400).json({error: '업로드가 허용되지 않는 확장자를 가진 파일이 포함되어 있습니다 : ' + ext})
            }

            let fileName = md5(`${Date.now()}_${originalName}`) + randomstring.generate(5) + ext; // 파일이름을 랜덤하게 변경합니다. 한글이나 유니코드등 사용할수 없는 문자를 처리하기 위함입니다.
            let filePath = path.join(uploadPath, fileName); // 파일이 업로드될 경로 +

            // 혹시 동일한 파일명이 존재한다면 파일명이 겹치지 않을떄까지 파일명을 계속 변경해 봅니다.
            while (fs.existsSync(filePath)) {
                fileName = md5(`${Date.now()}_${originalName}`) + randomstring.generate(5) + ext;
                filePath = path.join(uploadPath, fileName);
            }

            fs.renameSync( file.path, filePath )

            // 응답결과에 추가해줍니다.
            resultArray.push({
                file_url: path.join(path.sep, 'attaches', yearMonth, fileName),
                file_path: path.join(directory , fileName),
                original_name: originalName,
                isImage: imageExt.indexOf(ext) >= 0,
                extension: ext,
                mime: file.mimetype,
                file_size: file.size
            });
        })
        return res.json(resultArray);
    });
});


/**
 * 객체 내보내기
 */
module.exports = router;