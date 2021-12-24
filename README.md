# express-disk-deploy

> Make any external disk (external hard drive, USB stick, ...) a static content hosting server with an integrated API made with the power of Express.

## Installation

```bash
# Make sure you have Node.js and Yarn installed.
node -v
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

## How does it work ?

Clean your disk. Now you'll create folders.


So, you'll need the drive name. Using `lsblk`, I can know that mine is `/dev/sda1`. By the way, don't forget to mount it !

Now, you deploy your CDN using `yarn start /dev/sda1 --port 9090`, and you realize, how do you import content to your drive and where it is stored?

Firstly, the folder where all the content for this domain is named exactly the same as the domain. Using the example before (`assets.example.com`), the folder created that we'll be used to store content will be named `assets.example.com` too !

Then, it means that you can manually import content to your CDN by moving files to this directory.

Now, how do you access to, for example, a picture "image.png" that was moved to the `assets.example.com` folder.
- Simply navigate to it `assets.example.com/raw/image.png`
  - This URL will give you the image as is, without any compression, etc...

## API

The deployed CDN gives a basic API.
We'll use `domain.com` as the CDN URL, for these examples.

### Access content

We have contents in the `domain.com` folder, and want to access it. What are the differents methods to proceed ?

- `/raw/image.png`
  - This will give you a file without any modification.
- `/data/image.png`
  - This will return a JSON file, which is structured like this...

```typescript
{
  file: {
    fullName: string;
    mime: string;
    size: number; // In bytes.
  },
  data: string; // Base64 Encoded Content.
}
```

### Update/Create content

You need to make a `POST` request to `/upload`, with the file content in it.

By the way, you need to authenticate in this one using a custom header.

Headers
```typescript
headers: {
  "Authorization": `Bearer {your_token}`
}
```

POST Payload to `/upload`.

```typescript
{
  fileName: string;
  content: string; // File Content Enconded in Base64.
}

### How to have the authentication token

When you run the script for the first time, you'll see a file `token.json` that will be created.
The authentication token will be in it.
You can reset your authentication token by deleting the file and restarting the script.
