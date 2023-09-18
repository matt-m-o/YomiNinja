import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from "path";
import { ProtoGrpcType } from './rpc/ocr_service';

const ocrServicePackageDefinition = protoLoader.loadSync( join(__dirname, "../grpc/protos/ocr_service.proto"), {
    keepCase: true,
});

export const ocrServiceProto = grpc.loadPackageDefinition(
    ocrServicePackageDefinition
) as unknown as ProtoGrpcType;