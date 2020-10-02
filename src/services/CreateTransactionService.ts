import { getRepository } from 'typeorm';
import { uuid } from 'uuidv4';
import Category from '../models/Category';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface TransactionRequest {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionRequest): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);

    const categorie = categoriesRepository.create({
      title: category,
    });
    await categoriesRepository.save(categorie);

    const transactionsRepository = getRepository(Transaction);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
