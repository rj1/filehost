<?php

require __DIR__ . '/config.php';
require __DIR__ . '/vendor/autoload.php';
use Aws\S3\S3Client;

$allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'audio/mp4',
    'application/mp4',
    'application/octet-stream',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
];

$uploadedFile = $_FILES['file'];

if (!isset($uploadedFile)) {
    die('no file was uploaded');
}

if (!$uploadedFile['size'] || $uploadedFile['size'] > MAX_FILE_SIZE) {
    die('invalid file size');
}

if (!in_array($uploadedFile['type'], $allowedMimeTypes)) {
    die('invalid file type: ' . $uploadedFile['type']);
}

$nameToUpload = generateFilename($uploadedFile['name']);
$upload = uploadToBucket($uploadedFile['tmp_name'], $nameToUpload);

if ($upload) {
    echo $upload;
} else {
    echo "error uploading file";
}

function uploadToBucket($filePath, $name)
{

    $s3Client = new S3Client([
        'endpoint' => "https://" . B3_ENDPOINT,
        'credentials' => [
            'key' => B3_KEY,
            'secret' => B3_SECRET
        ],
        'region' => B3_REGION,
        'version' => 'latest'
    ]);

    $uploadToBucket = $s3Client->putObject([
        'Bucket' => B3_BUCKET_NAME,
        'Key' => $name,
        'SourceFile' => $filePath,
        'ACL' => 'public-read',
        'ContentType' => 'b2/x-auto',
    ]);

    $bucketDomain = B3_BUCKET_NAME . "." . B3_ENDPOINT;

    if ($uploadToBucket['@metadata']['statusCode'] == 200) {
        $url = str_replace($bucketDomain, FILE_DOMAIN, $uploadToBucket['@metadata']['effectiveUri']);
        return $url;
    }
    else {
        return false;
    }
}

function generateFilename($originalFilename)
{
    $randomString = bin2hex(random_bytes(5));

    if (str_contains($originalFilename, '.')) {
        $parts = explode('.', $originalFilename);
        return $randomString . "." . end($parts);
    }

    return $randomString;
}
