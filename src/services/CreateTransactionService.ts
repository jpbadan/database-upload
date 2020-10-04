import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
// import AppError from '../errors/AppError';

// [ ] - Verificar tipo e jogar erro caso n bata!

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionRequest {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute(
    { title, value, type, categoryTitle }: TransactionRequest,
    modeCsv = false,
  ): Promise<Transaction> {
    // data validation
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError("Wrong type. type must be 'income' or 'outcome'", 400);
    }

    // Creates a new transaction with the right category id
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    // Verifies if user has a valid balance:
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total && modeCsv === false) {
      // console.log('funds error');
      throw new AppError('Insuficient Funds', 400);
    }

    // Verifies if category already exists and creates a new one if it is the case
    let transactionCategory = await categoriesRepository.findOne({
      where: { title: categoryTitle },
    });

    if (!transactionCategory) {
      transactionCategory = categoriesRepository.create({
        title: categoryTitle,
      });
      await categoriesRepository.save(transactionCategory);
    }

    // Creates a new transaction with the right category id
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
