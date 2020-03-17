import DataElement from '../store/interfaces/DataElement';
import faker from 'faker';
import en from '../store/interfaces/En';

export const generateMockData = (count: number): DataElement[] => {
	const data: DataElement[] = [];

	for (let i = 0; i < count; i += 1) {
		let randNum = faker.random.number(2);
		data.push({
			phone: faker.phone.phoneNumber(),
			firstName: faker.name.findName(),
			lastName: faker.name.lastName(),
			age: faker.random.number(80),
			work: faker.random.boolean(),
			status: en[randNum],
			city: faker.address.city(),
		});
	}

	return data;
};
