import static org.junit.Assert.assertEquals;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

public class TestXPathEvaluator {
	static WebDriver driver;
	static WebElement query;
	static WebElement submitQuery;
	static WebElement result;

	/*
	 * Uncomment for demonstration
	 */
	static long sleepTime = 0; // 750;

	@BeforeClass
	public static void oneTimeSetUp() throws InterruptedException {
		driver = new FirefoxDriver();
		driver.get("file:///E:/college/sophomore/spring/CSSE433/project/csse433-xpath-evaluator/index.html");
		Thread.sleep(sleepTime);
		query = driver.findElement(By.id("xpath"));
		submitQuery = driver.findElement(By.id("evaluate"));
		result = driver.findElement(By.className("results"));

		driver.findElement(By.id("loadXml")).click();
		Thread.sleep(sleepTime);
		WebElement xmlBox = driver.findElement(By.id("xmlData"));
		xmlBox.clear();
		xmlBox.sendKeys("<bookstore specialty=\"novel\"><book style=\"autobiography\"><author><first-name>Joe</first-name><last-name>Bob</last-name><award>Trenton Literary Review Honorable Mention</award></author><price>12</price></book><book style=\"textbook\"><author><first-name>Mary</first-name><last-name>Bob</last-name><publication>Selected Short Stories of<first-name>Mary</first-name><last-name>Bob</last-name></publication></author><editor><first-name>Britney</first-name><last-name>Bob</last-name></editor><price>55</price></book><magazine style=\"glossy\" frequency=\"monthly\"><price>2.50</price><subscription price=\"24\" per=\"year\"/></magazine><book style=\"novel\" id=\"myfave\"><author><first-name>Toni</first-name><last-name>Bob</last-name><degree from=\"Trenton U\">B.A.</degree><degree from=\"Harvard\">Ph.D.</degree><award>Pulitzer</award><publication>Still in Trenton</publication><publication>Trenton Forever</publication></author><price intl=\"Canada\" exchange=\"0.7\">6.50</price><excerpt><p>It was a dark and stormy night.</p><p>But then all nights in Trenton seem dark andstormy to someone who has gone through what<emph>I</emph> have.</p><definition-list><term>Trenton</term><definition>misery</definition></definition-list></excerpt></book></bookstore>");
		driver.findElement(By.className("load")).click();
		Thread.sleep(sleepTime);
	}

	@Before
	public void setUp() throws Exception {

	}

	/*
	 * XPath Examples from:
	 * http://msdn.microsoft.com/en-us/library/ms256086.aspx
	 */

	@Ignore
	@Test
	public void testDotSlashNode() throws Exception {
		executeQuery("./author");
		assertEquals("[]", result.getText());

		executeQuery("./first-name");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNode() throws Exception {
		executeQuery("author");
		assertEquals("[]", result.getText());

		executeQuery("first-name");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeDotNode() throws Exception {
		executeQuery("first.name");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testSlashNode() throws Exception {
		executeQuery("/bookstore");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testDoubleSlashNode() throws Exception {
		executeQuery("//author");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeWithParameters() throws Exception {
		executeQuery("book[/bookstore/@specialty=@style]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSlashNode() throws Exception {
		executeQuery("author/first-name");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeDoubleSlashNode() throws Exception {
		executeQuery("bookstore//title");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeAsterickNode() throws Exception {
		executeQuery("bookstore/*/title");
		assertEquals("[]", result.getText());

		executeQuery("book/*/last-name");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeDoubleSlashNodeSlashNodeDoubleSlashNode()
			throws Exception {
		executeQuery("bookstore//book/excerpt//emph");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testDotDoubleSlashNode() throws Exception {
		executeQuery(".//title");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeAsterick() throws Exception {
		executeQuery("author/*");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAsterickSlashAsterick() throws Exception {
		executeQuery("*/*");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAsterickAttribute() throws Exception {
		executeQuery("*[@specialty]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAttribute() throws Exception {
		executeQuery("@style");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSlashAttribute() throws Exception {
		executeQuery("price/@exchange");
		assertEquals("[]", result.getText());

		executeQuery("book/@style");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSlashAttributeSlashNode() throws Exception {
		executeQuery("price/@exchange/total");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeAttribute() throws Exception {
		executeQuery("book[@style]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAttributeAsterick() throws Exception {
		executeQuery("@*");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelector() throws Exception {
		executeQuery("author[1]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testDoubleSelector() throws Exception {
		executeQuery("author[first-name][3]");
		assertEquals("[]", result.getText());

		executeQuery("author[degree][award]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSlashSelector() throws Exception {
		executeQuery("x/y[1]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSlashSelectorPosition() throws Exception {
		executeQuery("x/y[position() = 1]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testGroupingSelector() throws Exception {
		executeQuery("(x/y)[1]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorSlashNodeSelector() throws Exception {
		executeQuery("x[1]/y[2]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorLast() throws Exception {
		executeQuery("book[last()]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSlashNodeSelectorLast() throws Exception {
		executeQuery("book/author[last()]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testGroupingSelectorLast() throws Exception {
		executeQuery("(book/author)[last()]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorNode() throws Exception {
		executeQuery("book[excerpt]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorNodeSlashNode() throws Exception {
		executeQuery("book[excerpt]/title");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorNodeSlashNodeSelectorNode() throws Exception {
		executeQuery("book[excerpt]/author[degree]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorNodeSlashNodeEndSelector() throws Exception {
		executeQuery("book[author/degree]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorAnd() throws Exception {
		executeQuery("author[degree and award]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorGroupOrAnd() throws Exception {
		executeQuery("author[(degree or award) and publication]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorAndNot() throws Exception {
		executeQuery("author[degree and not(publication)]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorNotGroupOrAnd() throws Exception {
		executeQuery("author[not(degree or award) and publication]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorValue() throws Exception {
		executeQuery("author[last-name = \"Bob\"]");
		assertEquals("[]", result.getText());

		executeQuery("author[first-name = \"Bob\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorSelectorValue() throws Exception {
		executeQuery("author[last-name[1] = \"Bob\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorSelectorPositionValue() throws Exception {
		executeQuery("author[last-name [position()=1]=\"Bob\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorAttributeValue() throws Exception {
		executeQuery("degree[@from != \"Harvard\"]");
		assertEquals("[]", result.getText());

		executeQuery("price[@intl = \"Canada\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorDotValue() throws Exception {
		executeQuery("author[. = \"Matthew Bob\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorAndValue() throws Exception {
		executeQuery("author[last-name = \"Bob\" and ../price &gt; 50]");
		assertEquals("[]", result.getText());

		executeQuery("author[last-name = \"Bob\" and first-name = \"Joe\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorPositionValue() throws Exception {
		executeQuery("book[position() &lt;=3]");
		assertEquals("[]", result.getText());

		executeQuery("degree[position() &lt; 3]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorNotValue() throws Exception {
		executeQuery("author[not(last-name = \"Bob\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSelectorAsterickValue() throws Exception {
		executeQuery("author[* = \"Bob\"");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSlashText() throws Exception {
		executeQuery("p/text()");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNodeSlashTextSelector() throws Exception {
		executeQuery("p/text()[2]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAncestorSelector() throws Exception {
		executeQuery("ancestor::book[1]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAncestorSelectorSelector() throws Exception {
		executeQuery("ancestor::book[author][1]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAncestorAncestorSelector() throws Exception {
		executeQuery("ancestor::author[parent::book][1]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNamespaceNode() throws Exception {
		executeQuery("my:book");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testNamespaceAsterick() throws Exception {
		executeQuery("my:*");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAttributeNamespaceAsterick() throws Exception {
		executeQuery("@my:*");
		assertEquals("[]", result.getText());
	}

	/*
	 * Test examples from http://msdn.microsoft.com/en-us/library/ms256236.aspx
	 */
	@Ignore
	@Test
	public void testChildNode() throws Exception {
		executeQuery("child::node()");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAttributeLocation() throws Exception {
		executeQuery("attribute::name");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAttributeLocationAsterick() throws Exception {
		executeQuery("ancestor::*");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testDescendant() throws Exception {
		executeQuery("descendant::para");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAncestor() throws Exception {
		executeQuery("ancestor::div");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testAncestorOrSelf() throws Exception {
		executeQuery("ancestor-or-self::div");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testDescendantOrSelf() throws Exception {
		executeQuery("descendant-of-self::para");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testSelf() throws Exception {
		executeQuery("self::para");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSlashDescendant() throws Exception {
		executeQuery("child::chapter/descendant::para");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildAsterickSlashChild() throws Exception {
		executeQuery("child::*/child::para");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testRoot() throws Exception {
		executeQuery("/");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testRootDescendant() throws Exception {
		executeQuery("/descendant::para");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testRootDescendantSlashChild() throws Exception {
		executeQuery("/descendant::olist/child::item");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSelectorPosition() throws Exception {
		executeQuery("child::para[position()=1]");
		assertEquals("[]", result.getText());

		executeQuery("child::para[position()&gt;1]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSelectorPositionLast() throws Exception {
		executeQuery("child::para[position()=last()");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSelectorPositionLastMinus1() throws Exception {
		executeQuery("child::para[position()=last()-1");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testRootDescendantPosition() throws Exception {
		executeQuery("/descendant::figure[position()=42]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testRootChildSlashChildPosition() throws Exception {
		executeQuery("/child::doc/child::chapter[position()=5]");
		assertEquals("[]", result.getText());

		executeQuery("/child::selction[position()=2]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSelectorAttributeValue() throws Exception {
		executeQuery("child::para[attribute::type=\"warning\"");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSelectorAttributeValueSelectorPosition()
			throws Exception {
		executeQuery("child::para[attribute::type=\"warning\"][position()=5]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSelectorPositionSelectorAttributeValue()
			throws Exception {
		executeQuery("child::para[position()=5][attribute::type=\"warning\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSelectorChildValue() throws Exception {
		executeQuery("child::chapter[child::title=\"Introduction\"]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildSelectorChild() throws Exception {
		executeQuery("child::chapter[child::title]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildAsterickSelectorSelfOrSelf() throws Exception {
		executeQuery("child::*[self::chapter or self::appendix]");
		assertEquals("[]", result.getText());
	}

	@Ignore
	@Test
	public void testChildAsterickSelectorSelfOrSelfSelectorPositionLast()
			throws Exception {
		executeQuery("child::*[self::chapter or self::appendix][position()=last()]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Testing Misc Items
	 */
	@Test
	public void testEmpty() throws Exception {
		executeQuery("//Website");
		assertEquals("[]", result.getText());
	}

	@Test
	public void testSingleSlash() throws Exception {
		executeQuery("/book");
		assertEquals("[]", result.getText());
	}

	@Test
	public void testSingleSlashMultiple() throws Exception {
		executeQuery("/bookstore/book/author/test");
		assertEquals("[]", result.getText());
	}

	@Test
	public void testSingleSlashAttribute() throws Exception {
		executeQuery("/bookstore/@specialty");
		assertEquals("\"novel\"", result.getText());
	}

	@Ignore
	@Test
	public void testSingleSlashMultipleAttribute() throws Exception {
		executeQuery("/bookstore/book/@style");
		assertEquals("[\"autobiography\", \"textbook\", \"novel\"]",
				result.getText());
	}

	@Ignore
	@Test
	public void testDoubleSlash() throws Exception {
		executeQuery("//book");
		assertEquals("[]", result.getText());
	}

	@After
	public void tearDown() throws Exception {

	}

	@AfterClass
	public static void oneTimeTearDown() {
		driver.quit();
	}

	public void executeQuery(String queryString) throws InterruptedException {
		query.clear();
		query.sendKeys(queryString);
		Thread.sleep(sleepTime / 2);
		submitQuery.click();
		Thread.sleep(sleepTime);
	}
}
