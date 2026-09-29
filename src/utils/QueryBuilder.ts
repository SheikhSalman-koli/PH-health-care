import {
    IQueryConfig,
    IQueryParams,
    IQueryResult,
    PrismaCountArgs,
    PrismaFilterString,
    PrismaFindManyAgrs,
    PrismaModelDelegate,
    PrismaNumberFilter,
    PrismaWhereConditon
} from "../app/interface/query.builder"

export class QueryBuilder<
    T,
    TWhereInput = Record<string, unknown>,
    TInclude = Record<string, unknown>
> {
    private query: PrismaFindManyAgrs
    private countQuery: PrismaCountArgs
    private page: number = 1
    private limit: number = 10
    private skip: number = 0
    private sortBy: string = "createdAt"
    private sortOrder: "asc" | "desc" = "desc"
    private selectFields: Record<string, boolean> | undefined


    constructor(
        private model: PrismaModelDelegate,
        private queryParams: IQueryParams,
        private config: IQueryConfig = {}
    ) {
        this.query = {
            where: {},
            include: {},
            select: {},
            orderBy: {},
            skip: 0,
            take: 10
        };

        this.countQuery = {
            where: {}
        }
    }


    search(): this {
        const { searchTerm } = this.queryParams || {}
        const { searchableFields } = this.config || {}

        if (searchTerm && searchableFields && searchableFields.length > 0) {
            const searchConditions: Record<string, unknown>[] = searchableFields.map((field) => {
                if (field.includes('.')) {

                    const parts = field.split('.')

                    if (parts.length === 2) {
                        const [relation, nestedFields] = parts

                        const filterString: PrismaFilterString = {
                            contains: searchTerm,
                            mode: 'insensitive' as const
                        }

                        return {
                            [relation]: {
                                some: {
                                    [nestedFields]: filterString
                                }
                            }
                        }

                    } else if (parts.length === 3) {
                        const [relation, nestedRelation, nestedFields] = parts

                        const filterString: PrismaFilterString = {
                            contains: searchTerm,
                            mode: "insensitive" as const,
                        }

                        return {
                            [relation]: {
                                some: {
                                    [nestedRelation]: {
                                        [nestedFields]: filterString
                                    }
                                }
                            }
                        }
                    }

                }

                const filterString: PrismaFilterString = {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                }

                return {
                    [field]: filterString
                }

            })

            const whereCondition = this.query.where as PrismaWhereConditon
            whereCondition.OR = searchConditions

            const countWhereCondition = this.countQuery.where as PrismaWhereConditon

            countWhereCondition.OR = searchConditions

        }

        return this

    }

    filter(): this {
        const { filterableFields } = this.config

        const excludedFields = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"]

        const filterParams: Record<string, unknown> = {}

        Object.keys(this.queryParams || {}).forEach((key) => {
            if (!excludedFields.includes(key)) {
                filterParams[key] = this.queryParams[key]
            }
        })

        const queryWhere = this.query.where as Record<string, unknown>
        const countQueryWhere = this.query.where as Record<string, unknown>

        Object.keys(filterParams).forEach((key) => {
            const value = filterParams[key]

            if (value === undefined || value === "") {
                return
            }

            const isAllowedValue = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);



            if (key.includes(".")) {
                const parts = key.split(".")

                if (filterableFields && !filterableFields.includes(key)) {
                    return
                }

                if (parts.length === 2) {
                    const [relation, nestedFields] = parts

                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {}
                        countQueryWhere[relation] = {}
                    }

                    const queryRelation = queryWhere[relation] as Record<string, unknown>
                    const countRelation = countQueryWhere[relation] as Record<string, unknown>

                    queryRelation[nestedFields] = this.parseFilterValue(value)
                    countRelation[nestedFields] = this.parseFilterValue(value)


                    return
                } else if (parts.length === 3) {
                      const [relation, nestedRelation, nestedField] = parts;

                    if(!queryWhere[relation]){
                        queryWhere[relation] = {
                            some: {}
                        };
                        countQueryWhere[relation] = {
                            some: {}
                        };
                    }
                    
                    const queryRelation = queryWhere[relation] as Record<string, unknown>;
                    const countRelation = countQueryWhere[relation] as Record<string, unknown>;

                    if(!queryRelation.some){
                        queryRelation.some = {};
                    }
                    if(!countRelation.some){
                        countRelation.some = {};
                    }

                    const querySome = queryRelation.some as Record<string, unknown>;
                    const countSome = countRelation.some as Record<string, unknown>;

                    if(!querySome[nestedRelation]){
                        querySome[nestedRelation] = {};
                    }

                    if(!countSome[nestedRelation]){
                        countSome[nestedRelation] = {};
                    }

                    const queryNestedRelation = querySome[nestedRelation] as Record<string, unknown>;
                    const countNestedRelation = countSome[nestedRelation] as Record<string, unknown>;

                    queryNestedRelation[nestedField] = this.parseFilterValue(value);
                    countNestedRelation[nestedField] = this.parseFilterValue(value);

                    return;
                }
            }

            if (!isAllowedValue) {
                return
            }

            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                queryWhere[key] = this.parseFilterRange(value as Record<string, string | number>)
                countQueryWhere[key] = this.parseFilterRange(value as Record<string, string | number>)
                return
            }
            // direct field
            queryWhere[key] = this.parseFilterValue(value)
            countQueryWhere[key] = this.parseFilterRange(value as Record<string, string | number>)
        })

        return this
    }

    pagination(): this {
        const page = Number(this.queryParams?.page) || 1
        const limit = Number(this.queryParams?.limit) || 10

        this.page = page
        this.limit = limit
        this.skip = (page - 1) * limit

        this.query.skip = this.skip
        this.query.take = this.limit

        return this
    }

    sort(): this {

        const sortBy = this.queryParams?.sotrBy || 'createdAt'
        const sortOrder = this.queryParams?.sortOrder === 'asc' ? 'asc' : 'desc'

        this.sortBy = sortBy
        this.sortOrder = sortOrder

        if (sortBy.includes('.')) {
            const parts = sortBy.split('.')

            if (sortBy.length === 2) {

                const [relation, nestedRelation] = parts

                this.query.orderBy = {
                    [relation]: {
                        [nestedRelation]: sortOrder
                    }
                }
            } else if (sortBy.length === 3) {
                const [relation, nestedRelation, nestedFiled] = parts

                this.query.orderBy = {
                    [relation]: {
                        [nestedRelation]: {
                            [nestedFiled]: sortOrder
                        }
                    }
                }
            } else {
                this.query.orderBy = {
                    [sortBy]: sortOrder
                }
            }
        } else {
            this.query.orderBy = {
                [sortBy]: sortOrder
            }
        }

        return this
    }

    fields(): this {
        const fieldParams = this.queryParams?.fields;

        if (fieldParams && typeof fieldParams === "string") {
            const fieldsArray = fieldParams
                .split(",")
                .map((f) => f.trim())
                .filter(Boolean);

            if (fieldsArray.length > 0) {
                const selectObj: Record<string, boolean> = {};

                fieldsArray.forEach((field) => {
                    selectObj[field] = true;
                });

                this.query.select = selectObj;

                delete this.query.include;
            }
        }

        return this;
    }

    include(relation: TInclude): this {

        if (this.selectFields) {
            return this
        }

        this.query.include = {
            ...(this.query.include as Record<string, unknown>),
            ...(relation as Record<string, unknown>)
        }

        return this
    }

    dynamicInclude(
        includeConfig: Record<string, unknown>,
        defaultInclude?: string[]
    ): this {

        if (this.selectFields) {
            return this
        }

        const result: Record<string, unknown> = {}

        defaultInclude?.forEach((field) => {
            if (includeConfig[field]) {
                result[field] = includeConfig[field]
            }
        })

        const includeParams = this.queryParams.include as string | undefined

        if (includeParams && typeof includeParams === "string") {
            const requesteedRelation = includeParams.split(',').map((relation) => relation.trim())

            requesteedRelation.forEach((relation) => {
                if (includeConfig[relation]) {
                    result[relation] = includeConfig[relation]
                }
            })
        }

        this.query.include = {
            ...(this.query.include as Record<string, unknown>),
            ...(result)
        }

        return this
    }

    where(condition: TWhereInput): this {

        this.query.where = this.deepMarge(
            this.query.where as Record<string, unknown>,
            condition as Record<string, unknown>
        )

        this.countQuery.where = this.deepMarge(
            this.countQuery.where as Record<string, unknown>,
            condition as Record<string, unknown>
        )

        return this
    }

    async execute(): Promise<IQueryResult<T>> {

        if (this.query.select && Object.keys(this.query.select).length === 0) {
            delete this.query.select;
        }

        if (this.query.select) {
            delete this.query.include;
        }

        delete this.countQuery.select;
        delete this.countQuery.include;

        const [total, data] = await Promise.all([
            this.model.count(this.countQuery as Parameters<typeof this.model.count>[0]),
            this.model.findMany(this.query as Parameters<typeof this.model.findMany>[0])
        ]);

        const totalPages = Math.ceil(total / (this.limit || 10));

        return {
            data: data as T[],
            meta: {
                page: this.page || 1,
                limit: this.limit || 10,
                total,
                totalPages
            }
        };
    }

    async count(): Promise<number> {
        return await this.model.count(this.countQuery as Parameters<typeof this.model.count>[0])
    }

    getQuery(): PrismaFindManyAgrs {
        return this.query
    }


    private parseFilterValue(value: unknown): unknown {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
            return Number(value)
        }

        if (Array.isArray(value)) {
            return { in: value.map((item) => this.parseFilterValue(item)) }
        }

        return value
    }

    private parseFilterRange(value: Record<string, string | number>): PrismaFilterString | PrismaNumberFilter | Record<string, unknown> {

        const rangeQuery: Record<string, string | number | (string | number)[]> = {}

        Object.keys(value).forEach((operator) => {
            const operatorValue = value[operator]

            const parsedValue: string | number = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue

            switch (operator) {
                case 'lt':
                case 'lte':
                case 'gt':
                case 'gte':
                case 'equals':
                case 'not':
                case 'contains':
                case 'startsWith':
                case 'endsWith':
                    rangeQuery[operator] = parsedValue
                    break;

                case 'in':
                case "notIn":
                    if (Array.isArray(operatorValue)) {
                        rangeQuery[operator] = operatorValue
                    } else {
                        rangeQuery[operator] = parsedValue
                    }

                    break;
                default:
                    break
            }

        })

        return Object.keys(rangeQuery).length > 0 ? rangeQuery : value

    }

    private deepMarge(
        target: Record<string, unknown>,
        source: Record<string, unknown>
    ): Record<string, unknown> {

        const result = { ...target }

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                    result[key] = this.deepMarge(
                        result[key] as Record<string, unknown>,
                        source[key] as Record<string, unknown>
                    )
                } else {
                    result[key] = source[key]
                }
            } else {
                result[key] = source[key]
            }
        }

        return result

    }

}
