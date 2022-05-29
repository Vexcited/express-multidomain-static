# express-multidomain-static

> Host static content for multiple domains in a specific folder.

## Installation

```bash
# Make sure you have Node.js and PNPm installed.
node -v # Should be >= 14
pnpm -v # Can be installed with `npm install --global pnpm`

# Clone this repository.
git clone https://github.com/Vexcited/express-multidomain-static

# Go into the project folder.
cd express-multidomain-static

# Install dependencies.
pnpm install

# Build the code.
pnpm build

# Start the server and pass as argument the root folder to be used.
# Here, I will use my external hard drive which is mounted on `/mnt/static_domains`.
pnpm start /mnt/static_domains --port 8090 # Default port is 8090.

# A `token.json` file is created and it stores your API token
# to use when uploading/editing content.
cat token.json # Shows the content of the file.
```

## Usage

The API is configured to run on `0.0.0.0:8090` by default. You can change it by running the port argument.

```bash
pnpm start /mnt/static_domains --port 4050
```

An authentication token will be generated in the `token.json` file. It will be used to update or create content through the API.
To reset it, simply delete it and restart the server, it will generate a new one.

## Explaining with an example

Imagine you have a folder at `/home/static/domains` and you own the domain `assets.example.com`.

How can you upload content to it ?
- Use the API with your authentication token stored in `token.json`, in the header of the request (`"Authorization": "Bearer <TOKEN>"`)
  - Simply make a `POST` request to `/data/your_file_name.json` with a `application/json` content-type body which contains the data of what you want to upload (`{ "content": "base64_string_here" }`).
  - It's uploaded ! You can now access it with `/raw/your_file_name.json` or `/data/your_file_name.json`.
- Use an FTP and upload files into the domain's folder.
  - In this example, you'll upload your files to `/home/static/domains/assets.example.com`.
  - You can now access these files with `/raw/your_file_name.fileExtension` or `/data/your_file_name.fileExtension`.

## API

We'll use `domain.com` hostname, for these examples. \
Also imagine you have a `image.png` in `/home/static/domains/domain.com`
and `random_name.json` in `/home/static/domains/domain.com/products`.

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
  raw_url: string; // URL for raw.
  data_url: string; // URL for data.
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
- `lint` => Lints the code with `eslint`.

## Deploy with `pm2`

You can easily deploy this with `pm2`.

```bash
# Install PM2
npm install --global pm2

# Allow it to start automatically at boot.
# It will give you some code to paste.
pm2 startup

# Paste code given from PM2 to allow execution on startup.

# Start the application
# Make sure to have bundled it using "yarn build" before.
# Replace "YOUR_APP_NAME" with the name of your choice.
# Replace also "/dev/sda1" by the name of your device.
# Replace the port "8090" if you want to change it.
pm2 start dist/index.js --name YOUR_APP_NAME -- /dev/sda1 --port 8090

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
