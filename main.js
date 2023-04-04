const express = require('express');
const app = express();
const sharp = require('sharp');
const uuid = require('uuid');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/banner', async (req, res) => {
  try {
    const width = 1920;
    const height = 1080;
    const bgColor = req.query.bgColor || '333333';
    const nameColor = req.query.nameColor || 'ffffff';
    const textColor = req.query.textColor || 'ffffff';
    const userImage = req.query.userImage || 'https://i.imgur.com/4M34hi2.png';
    const userName = req.query.userName || 'John Doe';

    const imageBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        {
          input: Buffer.from(` 
            <svg width="${width}" height="${height}">
              <rect width="100%" height="100%" fill="#${bgColor}" />
            </svg>
          `),
          blend: 'over',
        },
        {
          input: Buffer.from(` 
            <svg width="${width}" height="${height / 2}">
              <text
                x="50%"
                y="50%"
                dominant-baseline="middle"
                text-anchor="middle"
                style="
                  font-size: 100px;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  font-weight: bold;
                  fill: #${nameColor};
                "
              >
                ${userName}
              </text>
            </svg>
          `),
          top: height / 4,
          left: 0,
          blend: 'over',
        },
        {
          input: await sharp(userImage)
            .resize(Math.floor(height / 2), Math.floor(height / 2), {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .toBuffer(),
          top: height / 4,
          left: (width - height / 2) / 2,
          blend: 'over',
        },
        {
          input: Buffer.from(` 
            <svg width="${width}" height="${height}">
              <rect
                x="10%"
                y="40%"
                width="80%"
                height="5%"
                rx="10"
                ry="10"
                fill="#${bgColor}"
              />
              <text
                x="50%"
                y="50%"
                dominant-baseline="middle"
                text-anchor="middle"
                style="
                  font-size: 70px;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  font-weight: bold;
                  fill: #${textColor};
                "
              >
                Welcome to our server!
              </text>
            </svg>
          `),
          top: (height * 3) / 4,
          left: 0,
          blend: 'over',
        },
      ])
      .jpeg()
      .toBuffer();

    const fileName = `${uuid.v4()}.jpg`;
    const filePath = path.join(__dirname, 'public', 'images', fileName);

    await sharp(imageBuffer).toFile(filePath);

    res.sendFile(filePath);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
