import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPFSHTTPClient } from 'ipfs-http-client/dist/src/types';
import { IPFS } from 'src/environments/environment';
import { BlockchainService } from 'src/services/blockchain.service';
import { IpfsService } from 'src/services/ipfs.service';


@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  web3: any;
  abi: any = {};
  netWorkData: any = {};
  netId: any;
  address: any;
  contract: any;
  account: any;

  ipfs: IPFSHTTPClient;

  msg_text: string = '';

  result: any;

  Doctors: any;

  DoctorDetails: string[] = [];

  drInfoload: boolean = false;

  constructor(
    private bs: BlockchainService,
    ipfsService: IpfsService,
    private http: HttpClient
  ) {

    this.contract = bs.getContract().then((c: any) => {
      return c
    })
    this.ipfs = ipfsService.getIPFS();
  }

  getDrs(): Promise<any> {
    return new Promise((resolve) => {
      this.bs.getContract().then((contract: any) => {
        this.Doctors = contract.methods.getAllDrs()
          .call()
          .then((docs: any) => {
            this.Doctors = docs;
            console.log(this.Doctors);
            resolve(this.Doctors)
          });
      })

    })
  }

  getDoctorDetails(docID: any): Promise<any> {
    console.log(docID);

    return new Promise((resolve) => {
      this.bs.getContract().then((contract: any) => {
        contract.methods
          .getDr(docID)
          .call()
          .then((ipfsHash: string) => {
            console.log(ipfsHash);
            this.http.get(IPFS.localIPFSGet + ipfsHash)
              .subscribe((data: any) => {
                console.log(data);
                resolve(data);
              });
          });
      })
    })
  }

  addDoctor(docId: string, data: any): Promise<any> {
    console.log(docId)
    console.log(data)
    return new Promise((resolve, reject) => {
      console.log('vao roi')
      this.bs.getContract().then(c => {
        console.log('vao roi 1')
        this.bs.getCurrentAcount().then(a => {
          console.log('vao roi 2')
          this.addRecord(data).then(ipfsHash => {
            console.log('vao roi 3')
            c.methods
              .addDrInfo(docId, ipfsHash)
              .send({ from: a })
              .on("confirmation", (result: any) => {
                console.log('result', result);
                if (result == 1) {
                  resolve(result);
                }
                reject(false)
              })
              .catch((err: any) => {
                reject(false)
              });
          })
        })
      })
    })
  }
  async addRecord(data: any) {
    console.log('vao addRecord')
    let IPFShash = (await (this.ipfs.add(Buffer.from(JSON.stringify(data))))).path
    return IPFShash
  }
}
