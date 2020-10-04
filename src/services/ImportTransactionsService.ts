import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import Transaction from '../models/Transaction';
import multerConfig from '../multerConfig';
import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';
// import transactionsRouter from '../routes/transactions.routes';

interface RequestDTO {
  csvFilename: string;
}

class ImportTransactionsService {
  async execute({ csvFilename }: RequestDTO): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const csvFilePath = path.join(multerConfig.directory, csvFilename);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    // const transactions: Transaction[] = [];
    // eslint-disable-next-line prefer-const
    const lines: string[] = [];

    parseCSV.on('data', line => {
      // const transaction = await createTransaction.execute({
      //   title: line[0],
      //   type: line[1],
      //   value: line[2],
      //   categoryTitle: line[3],
      // });
      // transactions.push(transaction);
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    function convert(str: string): 'income' | 'outcome' {
      if (str === 'income') {
        return 'income';
      }
      if (str === 'outcome') {
        return 'outcome';
      }
      throw new AppError('Type must be income or outcome', 400);
    }

    const transactions = await Promise.all(
      lines.map(async line => {
        const transaction = await createTransaction.execute(
          {
            title: line[0],
            type: convert(line[1]),
            value: parseInt(line[2], 0),
            categoryTitle: line[3],
          },
          true,
        );
        return transaction;
      }),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
