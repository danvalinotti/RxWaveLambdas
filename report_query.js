module.exports = "select g.* from (select distinct on (f.drug_id, f.rank) f.* from (select p1.id, p1.name, p1.drug_id, p1.rank, p1.dosage_strength, p1.quantity, p1.ndc, p1.gsn, p1.recommended_price, p1.zip_code,\n" +
    "\tcoalesce(p1.unc_price, p2.unc_price) as unc_price, \n" +
    "\tcoalesce(p1.insiderx_price, p2.insiderx_price) as insiderx_price,\n" +
    "\tcoalesce(p1.insiderx_pharmacy, p2.insiderx_pharmacy) as insiderx_pharmacy,\n" +
    "\tcoalesce(p1.pharm_price, p2.pharm_price) as pharm_price,\n" +
    "\tcoalesce(p1.pharm_pharmacy, p2.pharm_pharmacy) as pharm_pharmacy,\n" +
    "\tcoalesce(p1.wellrx_price, p2.wellrx_price) as wellrx_price,\n" +
    "\tcoalesce(p1.wellrx_pharmacy, p2.wellrx_pharmacy) as wellrx_pharmacy,\n" +
    "\tcoalesce(p1.medimpact_price, p2.medimpact_price) as medimpact_price,\n" +
    "\tcoalesce(p1.medimpact_pharmacy, p2.medimpact_pharmacy) as medimpact_pharmacy,\n" +
    "\tcoalesce(p1.singlecare_price, p2.singlecare_price) as singlecare_price,\n" +
    "\tcoalesce(p1.singlecare_pharmacy, p2.singlecare_pharmacy) as singlecare_pharmacy,\n" +
    "\tcoalesce(p1.singlecare_price, p2.singlecare_price) as singlecare_price,\n" +
    "\tcoalesce(p1.singlecare_pharmacy, p2.singlecare_pharmacy) as singlecare_pharmacy,\n" +
    "\tcoalesce(p1.goodrx_price, p2.goodrx_price) as goodrx_price,\n" +
    "\tcoalesce(p1.goodrx_pharmacy, p2.goodrx_pharmacy) as goodrx_pharmacy,\n" +
    "\tcoalesce(p1.blink_price, p2.blink_price) as blink_price,\n" +
    "\tcoalesce(p1.blink_pharmacy, p2.blink_pharmacy) as blink_pharmacy\n" +
    "from (\n" +
    "Select ROW_NUMBER() OVER (ORDER BY s.name) AS id , *\n" +
    "from (           (\n" +
    "    SELECT\n" +
    "      t.name, t.rank, t.drug_id, t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM \n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 0 \n" +
    "      order by name) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.rank,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price,t.unc_price, t.zip_code\n" +
    "    ORDER BY t.name, t.dosage_strength\n" +
    "    )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 1\n" +
    "      order by drug_id) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 2) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 3) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.rank, price.unc_price\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 4) t\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )) s\n" +
    " ORDER BY name ,dosage_strength, rank  \n" +
    ") p1 full outer join (\n" +
    "Select ROW_NUMBER() OVER (ORDER BY s.name) AS id , *\n" +
    "from (           (\n" +
    "    SELECT\n" +
    "      t.name, t.rank, t.drug_id, t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM \n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 0 \n" +
    "      order by name) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.rank,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price,t.unc_price, t.zip_code\n" +
    "    ORDER BY t.name, t.dosage_strength\n" +
    "    )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 1\n" +
    "      order by drug_id) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 2) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 3) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.rank, price.unc_price\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 4) t\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )) s\n" +
    "where s.unc_price is not null ORDER BY name ,dosage_strength, rank  \n" +
    ") p2 on p1.rank = p2.rank and p1.drug_id = p2.drug_id ) f ) g order by g.name, g.ndc, g.rank\n";