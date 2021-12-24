# express-disk-deploy

> Make any external disk (external hard drive, USB stick, ...) a static content hosting server with an integrated API made with the power of Express.

## Installation

```bash
# Make sure you have Node.js and Yarn installed.
node -v # Should be >= 14
yarn -v

# Clone this repository.
git clone https://github.com/Vexcited/express-disk-deploy

# Go into the project folder.
cd express-disk-deploy

# Install dependencies.
yarn

# Build the app.
yarn build

# Start the server and pass as argument the device to be used deployed.
# Here, my external hard drive's name is /dev/sda1. (By the way, it needs to be mounted !)
# You can know it by running `lsblk`
yarn start /dev/sda1 --port 8090 # Default port is 8090.

# A `token.json` file is created and it stores your API token
# to use when uploading/editing content.
cat token.json # Shows the content of the file.
```

## Usage

The API is configured to run on `0.0.0.0:8090` by default. You can change it by running the port argument.

```bash
yarn start /dev/sda1 --port 4050
```

A authentication token will be generated in the `token.json` file. It will be used to update or create content through the API.
To reset it, simply delete it and restart the server, it will generate a new one.

## Explaining with an example

Imagine you have deployed your disk `/dev/sda1` to this domain `assets.example.com`.

How can you upload content to it ?
- Use the API with your authentication token stored in `token.json`.
  - Simply make a `POST` request to `/data/your_file_name.json` with a `application/json` content-type body which contains the data of what you want to upload (`{ "content": "base64_string_here" }`).
  - It's uploaded ! You can now access it with `/raw/your_file_name.json` or `/data/your_file_name.json`.
- Use an FTP and paste files into the domain's folder.
  - **Example** - You deployed the disk `/dev/sda1` which is mounted at `/mnt/my_external_disk`.
  - In this example, you'll upload your files to `/mnt/my_external_disk/assets.example.com`.
  - You can now access these files with `/raw/your_file_name.fileExtension` or `/data/your_file_name.fileExtension`.

## API

We'll use `domain.com` hostname, for these examples. \
Also imagine you have a `image.png` in `/mnt/my_disk/domain.com`
and `random_name.json` in `/mnt/my_disk/domain.com/products`.

### `GET /raw/:fileName[?folder=/]`

- GET `/raw/image.png`
  - This will give you the `image.png` file raw like it is.
- GET `/raw/random_name.json?folder=products/
  - This will give you the `random_name.json` file into the `products` folder.
  - Note: You can also have multiple folders like this: `?folder=/products/data/images/`
    - Note: The trailling slash at the start and at the end are **not required**.

#### Error Response

```typescript
interface GetRawErrorResponse {
  success: false;
  message: string;
}
```

### `GET /data/:fileName[?folder=/]`

- GET `/data/image.png`
  - This will give you the Base64 Encoded content of `image.png` with also informations about the parsed name and folder.
- GET `/raw/random_name.json?folder=products/`
  - Does the same thing but in the `products` subfolder.

#### Successful Response

```typescript
interface GetDataResponse {
  success: true;
  informations: {
    name: string; // File's parsed name.
    subFolder?: string; // Subfolder's parsed name.
  };
  data: string; // File encoded in Base64.
}
```

#### Error Response

```typescript
interface GetDataErrorResponse {
  success: false;
  message: string;
  error?: any;
}
```
### `POST /data/:fileName[?folder=/]`

You need to set the `Content-Type` header to `application/json` and also specify your token in the `Authorization` header (eg.: `"Authorization": "Bearer MY_TOKEN_HERE"`).

The content of the file needs to be specified in the request's body in the `content` property with a value encoded in Base64. 

```typescript
/** Request's body. */
const body = {
  content: btoa("Hello, world !"); // Encode in Base64.
};
```

- POST `/data/random_name.json?folder=products/`
  - Edits or creates the file `random_name.json` under the subfolder `products`. 

#### Successful Response

```typescript
interface PostDataResponse {
  success: true;
  filePath: string; // Path on the server for debugging purposes.
  url: string; // URL where it has been deployed.
}
```

#### Error Response

```typescript
interface PostDataErrorResponse {
  success: false;
  message: string;
  error?: any;
}
```

## Scripts

- `dev` => Runs `nodemon` with `ts-node` in development mode.
- `build` => Builds the TypeScript code and outputs to `dist` folder.
- `start` => Starts the bundled script (`dist/index.js`). 
- `lint` => Lint the code with `eslint`.

## Deploy with `pm2`

You can easily deploy this with `pm2`.

```bash
# Install PM2
yarn global add pm2

# Allow it to start automatically at boot.
# It will give you some code to paste.
pm2 startup

# Paste code to allow startup.

# Start the application
# Make sure to have bundled it using "yarn build" before.
pm2 start dist/index.js --name YOUR_APP_NAME -- --port 8090

# Now you can save the process to make it start at boot.
pm2 save

# Also, you can monitor and check the running process
pm2 status

# Reload the process
pm2 reload YOUR_APP_NAME

# Restart the process
pm2 restart YOUR_APP_NAME

# Stop the process
pm2 stop YOUR_APP_NAME

# Delete the process
pm2 delete YOUR_APP_NAME
```

You can find more informations about PM2 on their official documentation <https://pm2.keymetrics.io/docs/usage/quick-start>.