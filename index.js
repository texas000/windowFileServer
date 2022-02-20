var express = require("express");
var multer = require("multer");
var http = require("http");
var path = require("path");
var fs = require("fs");
var sql = require("mssql");
var cors = require("cors");
var app = express();

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads");
		// REPLACE UPLOADS WITH process.env.LOCAL_PATH
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

var upload = multer({ storage: storage });

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.post("/uploadfile", upload.single("myFile"), (req, res, next) => {
	const file = req.file;
	if (!file) {
		const error = new Error("Please upload a file");
		error.httpStatusCode = 400;
		return next(error);
	}

	res.send(file);
});

//Uploading multiple files
app.post("/uploadmultiple", upload.array("myFiles", 12), (req, res, next) => {
	const files = req.files;
	if (!files) {
		const error = new Error("Please choose files");
		error.httpStatusCode = 400;
		return next(error);
	}

	res.send(files);
});

app.post("/uploadphoto", upload.single("picture"), (req, res) => {
	var img = fs.readFileSync(req.file.path);
	var encode_image = img.toString("base64");
	// Define a JSONobject for the image attributes for saving to database

	var finalImg = {
		contentType: req.file.mimetype,
		image: new Buffer(encode_image, "base64"),
	};
	console.log(finalImg);
	res.redirect("/");
});

// -----------------------OLD VERSION ---------------------------

// NAS located at JW James server rack
// let pool = new sql.ConnectionPool(process.env.DB_LOG);
// let server21 = new sql.ConnectionPool(process.env.DB_JWIUSA);
// var corsOptions = {
// 	origin: "https://jwiusa.com",
// 	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// UPLOAD FILE
// app.post("/api/upload/:ref", cors(corsOptions), async function (req, res) {
// 	// Get parameter from the link
// 	const reference = req.params.ref;

// 	// Define storage path under forwarding
// 	var forwardingStorage = multer.diskStorage({
// 		destination: function (req, file, callback) {
// 			callback(null, `J:\\FORWARDING\\${reference}`);
// 		},
// 		filename: function (req, file, callback) {
// 			callback(null, file.originalname);
// 		},
// 	});

// 	// Define multer with assigned path
// 	var forwardingUpload = multer({ storage: forwardingStorage }).single(
// 		"userPhoto"
// 	);

// 	// Check if the folder exist
// 	fs.access(`J:\\FORWARDING\\${reference}`, fs.constants.F_OK, async (err) => {
// 		// If folder does not exist, create the folder
// 		if (err) {
// 			fs.mkdirSync(`J:\\FORWARDING\\${reference}`);
// 		}
// 		// Connect database
// 		await pool.connect();
// 		// Upload file
// 		forwardingUpload(req, res, async function (err) {
// 			// Add log to database
// 			let result = await pool
// 				.request()
// 				.query(
// 					`INSERT INTO T_FILE VALUES (N'${req.file.originalname}', N'', '${reference}', 'UPLOAD', GETDATE());`
// 				);
// 			if (err) {
// 				console.log(err);
// 				return res.end("Error uploading file");
// 			}
// 			res.end("File is uploaded");
// 		});
// 	});
// });

// // GET LIST OF REFERENCE
// app.get("/api/forwarding/:folder", async function (req, res) {
// 	const filefolder = req.params.folder;
// 	var target = `J:\\FORWARDING\\${filefolder}`;
// 	fs.readdir(target, (err, files) => {
// 		if (err) {
// 			res.status(400).send(err);
// 		}
// 		res.status(200).send(files);
// 	});
// 	//   console.log(await ip.v4());
// });

// // GET A SPECIFIC FILE with referece defined
// app.get("/api/forwarding/:folder/:name", async function (req, res) {
// 	const filename = req.params.name;
// 	const filefolder = req.params.folder;

// 	// Get path for the file
// 	var target = `J:\\FORWARDING\\${filefolder}\\${filename}`;

// 	// Connect database
// 	await pool.connect();

// 	// Add log to database
// 	let result = await pool
// 		.request()
// 		.query(
// 			`INSERT INTO T_FILE VALUES (N'${filename}', N'', '${filefolder}', 'ACCESS', GETDATE());`
// 		);

// 	fs.access(target, fs.constants.F_OK, (err) => {
// 		// File not exist
// 		if (err) {
// 			return res.status(404).send("File Not Exist");
// 		}
// 		res.download(target, filename, (err) => {
// 			if (err) {
// 				res.status(500).send(err);
// 			}
// 		});
// 	});
// });

// // UPLOAD FILE
// app.post("/api/file/upload/:ref", cors(corsOptions), async function (req, res) {
// 	// Get parameter from the link
// 	const reference = req.params.ref;
// 	var person = req.headers.upload_by;
// 	var label = req.headers.label;
// 	var security = req.headers.security;
// 	// Requirements headers need to be fullfilled in order to save to the database
// 	if (!person || !label || !security) {
// 		return res.status(400).send({
// 			error: true,
// 			message: "Invalid requirements. Please try again.",
// 		});
// 	}

// 	// Check if the file is exist in the folder
// 	var targetFolder = `J:\\FORWARDING\\${reference}`;
// 	//   var targetFolder = `/Volumes/JWI/FORWARDING/${reference}`;
// 	// Define new file name
// 	var newFileName = "";
// 	// Define storage path under forwarding
// 	var forwardingStorage = multer.diskStorage({
// 		destination: function (req, file, callback) {
// 			callback(null, targetFolder);
// 		},
// 		filename: async function (req, file, callback) {
// 			// If file exist already, throw an error
// 			try {
// 				newFileName = `${path.win32.basename(
// 					file.originalname,
// 					path.extname(file.originalname)
// 				)}_${Date.now()}${path.extname(file.originalname)}`;
// 				if (fs.existsSync(`${targetFolder}\\${newFileName}`)) {
// 					return res.status(403).send({
// 						error: true,
// 						message: `File already exist - ${newFileName}`,
// 					});
// 				}
// 			} catch (err) {
// 				return res
// 					.status(500)
// 					.send({ error: true, message: JSON.stringify(err) });
// 			}
// 			callback(null, newFileName);
// 		},
// 	});

// 	// Define multer with assigned path
// 	var forwardingUpload = multer({ storage: forwardingStorage }).any(
// 		"userPhoto"
// 	);

// 	// Check if the folder exist
// 	fs.access(targetFolder, fs.constants.F_OK, async (err) => {
// 		// If folder does not exist, create the folder
// 		if (err) {
// 			if (err.code == "ENOENT") {
// 				try {
// 					fs.mkdirSync(targetFolder);
// 				} catch (err) {
// 					console.log("FOLDER EXISTS: " + targetFolder);
// 				}
// 			}
// 		}
// 		// Upload file
// 		forwardingUpload(req, res, async function (err) {
// 			if (err) {
// 				console.log("Error from Uploading Files");
// 				res.status(502).send({ error: true, message: JSON.stringify(err) });
// 			}
// 			// Connect database
// 			const LOG_FETCH = await pool
// 				.connect()
// 				.then(async (log) => {
// 					const fetch = await log
// 						.request()
// 						.query(
// 							`INSERT INTO T_FILE VALUES (N'${newFileName.replace(
// 								"'",
// 								"''"
// 							)}', N'', '${reference}', 'UPLOAD', GETDATE());`
// 						);
// 					return fetch.rowsAffected[0];
// 				})
// 				.catch((err) => {
// 					return res.status(503).send({
// 						error: true,
// 						message: JSON.stringify(err),
// 						code: "ERROR-SERVER5",
// 					});
// 				});
// 			if (LOG_FETCH) {
// 				const FILE_FETCH = await server21
// 					.connect()
// 					.then(async (srv) => {
// 						const fetch = await srv
// 							.request()
// 							.query(
// 								`INSERT INTO T_FILE VALUES ('${person}', GETDATE(), '${label}', '${reference}', '${security}', N'${newFileName.replace(
// 									"'",
// 									"''"
// 								)}')`
// 							);
// 						return fetch.rowsAffected[0];
// 					})
// 					.catch((err) => {
// 						return res.status(504).send({
// 							error: true,
// 							message: JSON.stringify(err),
// 							code: "ERROR-SERVER21",
// 						});
// 					});
// 				if (FILE_FETCH) {
// 					res.status(200).send({ error: false, message: "File uploaded" });
// 				} else {
// 					res
// 						.status(202)
// 						.send({ error: false, message: "File uploaded but not saved" });
// 				}
// 			}
// 		});
// 	});
// });

app.listen(49991, function () {
	console.log("File Server Working on port 49991");
});
